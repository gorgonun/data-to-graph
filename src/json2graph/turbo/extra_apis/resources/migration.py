from pydantic import BaseModel


class Migration(BaseModel):
    resource_id: str
    migration_name: str
    mongodb_url: str
    mongodb_database: str
    mongodb_collection: str
    migration_type: str
    root_database_name: str
    mongodb_producer_replicas: int
    json_to_node_replicas: int
    node_to_neo4j_replicas: int
    neo4j_create_relationship_replicas: int
    instance_ids: list[str]
