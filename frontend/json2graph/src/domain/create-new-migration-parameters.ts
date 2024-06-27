import { MigrationType } from "./migration-type";

export type CreateNewMigrationParameters = {
    migration_name: string;
    mongodb_url: string;
    mongodb_database: string;
    mongodb_collection: string;
    migration_type: MigrationType;
    root_database_name?: string;
    mongodb_producer_replicas?: number;
    json_to_node_replicas?: number;
    node_to_neo4j_replicas?: number;
    neo4j_create_relationship_replicas?: number;
}
