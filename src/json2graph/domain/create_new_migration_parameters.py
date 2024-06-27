from pydantic import BaseModel

from json2graph.domain.migration_type_enum import MigrationType


class CreateNewMigrationParameters(BaseModel, use_enum_values=True):
    migration_name: str
    mongodb_url: str
    mongodb_database: str
    mongodb_collection: str
    migration_type: MigrationType
    root_database_name: str | None = None
    mongodb_producer_replicas: int = 0
    json_to_node_replicas: int = 0
    node_to_neo4j_replicas: int = 0
    neo4j_create_relationship_replicas: int = 0
    mongodb_producer_limit: int | None = None
