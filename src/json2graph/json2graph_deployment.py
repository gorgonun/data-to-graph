import asyncio
from dataclasses import dataclass
import datetime
from typing import Annotated, Callable
from turbo_c2 import CentralApi, controller, JobApi
from turbo_c2.clients import PrometheusHttpClient
from turbo_c2.commands import ClientDefinition, JobControllerCrudCR
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient

from json2graph.domain.create_new_migration_parameters import CreateNewMigrationParameters
from json2graph.domain.get_collections_for_mongo_db import GetCollectionsForMongoDb
from json2graph.domain.get_databases_for_mongo_db import GetDatabasesForMongoDb
from json2graph.turbo.extra_apis.commands.migration_resource import MigrationResource
from json2graph.turbo.extra_apis.resources.migration import Migration


class MetricValue(BaseModel):
    timestamp: float
    value: str


class AggregatedMetricResult(BaseModel):
    labels: dict[str, str]
    values: list[MetricValue]


@dataclass
class PrometheusQuery:
    query: PrometheusHttpClient.InstantQuery | PrometheusHttpClient.RangeQuery
    name: str
    formatter: Callable[[dict], MetricValue | AggregatedMetricResult]


@controller(name="json2graph", route_prefix="/api/v1/j2g")
def get_deployment(app: FastAPI, central_api: CentralApi):
    class JsonToGraphDeployment:
        @app.get("/migrations/{migration_name}/status")
        async def get_migration_status(
            self,
            migration_name: str,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration: Migration = await central_api.execute(MigrationResource.get(migration_name))
            if not migration:
                raise HTTPException(
                    status_code=404,
                    detail=f"Migration not found: {migration_name}",
                )
            
            job_apis: list[JobApi] = await asyncio.gather(
                *[central_api.execute(JobControllerCrudCR.get(api_id)) for api_id in migration.instance_ids]
            )

            migration_status = {}

            for job_api in job_apis:
                name = await job_api.get_name()
                state = await job_api.get_state()
                replicas = await job_api.get_replicas()

                migration_status.setdefault(name, {}).update({"state": state, "replicas": replicas})

            return migration_status

        @app.put("/migrations/{migration_name}/start")
        async def start_migration(
            self,
            migration_name: str,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration: Migration = await central_api.execute(MigrationResource.get(migration_name))
            if not migration:
                raise HTTPException(
                    status_code=404,
                    detail=f"Migration not found: {migration_name}",
                )
            
            job_apis: list[JobApi] = await asyncio.gather(
                *[central_api.execute(JobControllerCrudCR.get(api_id)) for api_id in migration.instance_ids]
            )

            for job_api in job_apis:
                state = await job_api.get_state()
                replicas = await job_api.get_replicas()
                if state == "paused":
                    await job_api.resume()
                elif await job_api.get_replicas() == 0:
                    await job_api.scale(1)

            return migration
        
        @app.put("/migrations/{migration_name}/pause")
        async def pause_migration(
            self,
            migration_name: str,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration: Migration = await central_api.execute(MigrationResource.get(migration_name))
            if not migration:
                raise HTTPException(
                    status_code=404,
                    detail=f"Migration not found: {migration_name}",
                )
            
            job_apis: list[JobApi] = await asyncio.gather(
                *[central_api.execute(JobControllerCrudCR.get(api_id)) for api_id in migration.instance_ids]
            )

            await asyncio.gather(*[job_api.pause() for job_api in job_apis])

            return migration
        
        @app.put("/migrations/{migration_name}/stop")
        async def stop_migration(
            self,
            migration_name: str,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration: Migration = await central_api.execute(MigrationResource.get(migration_name))
            if not migration:
                raise HTTPException(
                    status_code=404,
                    detail=f"Migration not found: {migration_name}",
                )
            
            job_apis: list[JobApi] = await asyncio.gather(
                *[central_api.execute(JobControllerCrudCR.get(api_id)) for api_id in migration.instance_ids]
            )

            await asyncio.gather(*[job_api.scale(0) for job_api in job_apis])

            return migration

        @app.post("/collections/list")
        async def get_collections(
            self,
            parameters: GetCollectionsForMongoDb,
        ):
            try:
                collections = MongoClient(parameters.mongodb_url)[parameters.mongodb_database].list_collection_names()
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error while fetching collections: {str(e)}",
                )
            return collections
        
        @app.post("/databases/list")
        async def get_databases(
            self,
            parameters: GetDatabasesForMongoDb,
        ):
            try:
                databases = MongoClient(parameters.mongodb_url).list_database_names()
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error while fetching collections: {str(e)}",
                )
            return databases

        @app.get("/migrations")
        async def get_migrations(
            self,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migrations = await central_api.execute(MigrationResource.get())
            return migrations
        
        @app.get("/migrations/{migration_name}")
        async def get_migration(
            self,
            migration_name: str,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration = await central_api.execute(MigrationResource.get(migration_name))
            return migration
        
        @app.post("/migrations")
        async def create_migration(
            self,
            create_new_migration_parameters: CreateNewMigrationParameters,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
        ):
            migration = await central_api.execute(
                MigrationResource.create(create_new_migration_parameters, create_new_migration_parameters.migration_name)
            )
            return migration

        @app.get("/metrics/aggregated")
        async def get_metrics_aggregated(
            self,
            central_api: Annotated[CentralApi, Depends(lambda: central_api)],
            start: datetime.datetime | None = None,
            end: datetime.datetime | None = None,
            step: datetime.timedelta | None = None,
        ):
            prometheus_client: PrometheusHttpClient = await central_api.execute(
                ClientDefinition.get(PrometheusHttpClient)
            )

            start = start or datetime.datetime.now() - datetime.timedelta(days=7)
            end = end or datetime.datetime.now()

            steps_in_seconds = int(step.total_seconds() if step else 300)
            steps_in_seconds_str = f"{steps_in_seconds}s"

            metrics = [
                PrometheusQuery(
                    PrometheusHttpClient.InstantQuery(
                        "rate(j2g_write_data_total[30s])"
                    ),
                    "nodes_created_rate",
                    self.get_metric_from_response,
                ),
                PrometheusQuery(
                    PrometheusHttpClient.InstantQuery(
                        "rate(j2g_create_relationship_total[30s])"
                    ),
                    "relationship_created_rate",
                    self.get_metric_from_response,
                ),
                PrometheusQuery(
                    PrometheusHttpClient.InstantQuery("sum by(migration_name) (j2g_write_data_total)"),
                    "nodes_created_total",
                    self.get_metric_from_response,
                ),
                PrometheusQuery(
                    PrometheusHttpClient.InstantQuery(
                        "sum by(migration_name) (j2g_create_relationship_total)"
                    ),
                    "relationship_created_total",
                    self.get_metric_from_response,
                ),
                PrometheusQuery(
                    PrometheusHttpClient.RangeQuery(
                        f"sum by(migration_name) (rate(j2g_create_relationship_total[{steps_in_seconds_str}]) * {steps_in_seconds})",
                        start.timestamp(),
                        end.timestamp(),
                        steps_in_seconds_str,
                    ),
                    "chart_relationship_created_total_per_job_instance",
                    self.get_metric_from_response,
                ),
            ]

            result = {}

            for prometheus_query in metrics:
                data = prometheus_client.query(prometheus_query.query)
                result[prometheus_query.name] = prometheus_query.formatter(data)

            return result

        def get_metric_from_response(self, response):
            if response.get("status") == "success":
                if (
                    not response.get("data")
                ):
                    raise HTTPException(
                        status_code=500,
                        detail=f"Error while parsing matrix metrics: {response}",
                    )

                result = response.get("data", {}).get("result", [])
                if not result:
                    return []

                formatted_metrics: list[AggregatedMetricResult] = []

                for metric in result:
                    labels = metric.get("metric", {})
                    values = [
                        MetricValue(timestamp=timestamp, value=value)
                        for timestamp, value in metric.get("values", [])
                    ]

                    if metric.get("value"):
                        values.append(
                            MetricValue(
                                timestamp=metric["value"][0], value=metric["value"][1]
                            )
                        )

                    formatted_metrics.append(
                        AggregatedMetricResult(labels=labels, values=values)
                    )

                return formatted_metrics

            raise HTTPException(
                status_code=500, detail=f"Error while fetching metrics: {response}"
            )

    return JsonToGraphDeployment
