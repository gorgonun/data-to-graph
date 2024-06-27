from typing import Any
from turbo_c2 import ResourceCreator, NeedsCentralApi
from json2graph.domain.create_new_migration_parameters import (
    CreateNewMigrationParameters,
)
from json2graph.helpers.create_new_migration import create_new_migration

from json2graph.turbo.extra_apis.resources.migration import Migration


class MigrationCreator(ResourceCreator[CreateNewMigrationParameters], NeedsCentralApi):
    async def create(
        self,
        definition: CreateNewMigrationParameters,
        meta: dict[str, Any] | None = None,
    ):
        results = await create_new_migration(
            self.central_api,
            definition,
        )

        instance_ids = [key for result in results for key in result.instances_api["instance"].keys()]

        migration = Migration(
            resource_id=definition.migration_name,
            migration_name=definition.migration_name,
            mongodb_url=definition.mongodb_url,
            mongodb_database=definition.mongodb_database,
            mongodb_collection=definition.mongodb_collection,
            migration_type=definition.migration_type,
            root_database_name=definition.root_database_name or definition.mongodb_collection,
            mongodb_producer_replicas=definition.mongodb_producer_replicas,
            json_to_node_replicas=definition.json_to_node_replicas,
            node_to_neo4j_replicas=definition.node_to_neo4j_replicas,
            neo4j_create_relationship_replicas=definition.neo4j_create_relationship_replicas,
            instance_ids=instance_ids,
        )

        return migration
