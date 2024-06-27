import asyncio
import logging
import os
import sys

from dotenv import load_dotenv
from turbo_c2 import turbo

from json2graph.domain.create_new_migration_parameters import (
    CreateNewMigrationParameters,
)
from json2graph.domain.migration_type_enum import MigrationType
from json2graph.turbo.extra_apis.commands.migration_creator_definition import (
    MigrationCreatorDefinition,
)
from json2graph.turbo.extra_apis.commands.migration_resource import MigrationResource
from json2graph.turbo.extra_apis.json_to_graph_apis.json_to_graph_extra_api import (
    JsonToGraphExtraApi,
)
from json2graph.turbo.extra_apis.resources.migration_creator import MigrationCreator

load_dotenv("../.env", verbose=True)
from turbo_c2 import ExternalApi, extra_api
from turbo_c2.turbo_events import TurboEventsScheduler, consumer_settings, executor_settings

from json2graph.definitions import *
from json2graph.json2graph_deployment import *

logging.basicConfig(level=logging.INFO)

neo4j_log = logging.getLogger("neo4j")
neo4j_log.setLevel(logging.DEBUG)


@consumer_settings()
def custom_consumer_settings():
    return {
        "replicas": 2,
    }


@executor_settings()
def custom_executor_settings():
    return {
        "replicas": 4,
    }


@extra_api()
def custom_extra_api(central_api: CentralApi, mapping: dict[str, ExternalApi]):
    async def after_creation(central_api: CentralApi):
        await central_api.execute(
            MigrationCreatorDefinition.set(MigrationCreator(), "default")
        )

    return JsonToGraphExtraApi(central_api), after_creation


async def main():
    mongodb_producer_limit = os.environ.get("MONGO_PRODUCER_LIMIT")

    scheduler, central_api = await turbo.create(TurboEventsScheduler(), environment_variables={
        "MONGODB_URL": os.environ["MONGODB_URL"],
        "MONGODB_COLLECTION": os.environ["MONGODB_COLLECTION"],
        "MONGODB_DATABASE": os.environ["MONGODB_DATABASE"],
        "NEO4J_URL": os.environ["NEO4J_URL"],
        "NEO4J_USER": os.environ["NEO4J_USER"],
        "NEO4J_PASSWORD": os.environ["NEO4J_PASSWORD"],
        "PROMETHEUS_HOST": os.environ["PROMETHEUS_HOST"],
        "CUSTOM_HOST": os.environ["CUSTOM_HOST"],
    })

    migration_name = "Stack overflow migration"

    await central_api.execute(
        MigrationResource.create(
            CreateNewMigrationParameters(
                migration_name=migration_name,
                mongodb_url=os.environ["MONGODB_URL"],
                mongodb_database=os.environ["MONGODB_DATABASE"],
                mongodb_collection=os.environ["MONGODB_COLLECTION"],
                migration_type=MigrationType.ONE_TIME,
                mongodb_producer_replicas=1,
                json_to_node_replicas=3,
                node_to_neo4j_replicas=3,
                neo4j_create_relationship_replicas=5,
                mongodb_producer_limit=int(mongodb_producer_limit) if mongodb_producer_limit else None,
            ),
            migration_name,
            fail_if_exists=False,
        )
    )

    await scheduler.start()


if __name__ == "__main__":
    asyncio.run(main())
