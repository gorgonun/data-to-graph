import { Migration, MigrationWithExtraFields } from "../domain/migration";

export const calculateExtraMigrationFields = (
  migration: Migration
): MigrationWithExtraFields => {
  return {
    ...migration,
    replicas: +(
      (migration.mongodb_producer_replicas ?? 0) +
      (migration.json_to_node_replicas ?? 0) +
      (migration.node_to_neo4j_replicas ?? 0) +
      (migration.neo4j_create_relationship_replicas ?? 0)
    ).toFixed(0),
  };
};
