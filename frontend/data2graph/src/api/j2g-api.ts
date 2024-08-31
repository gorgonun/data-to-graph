import axios from "axios";
import { GetMetricsResponse } from "../domain/get-metrics-response";
import { Migration } from "../domain/migration";
import { CreateNewMigrationParameters } from "../domain/create-new-migration-parameters";
import { GetCollectionsForMongoDb } from "../domain/get-collections-for-mongo-db";
import { GetDatabasesForMongoDb } from "../domain/get-databases-for-mongo-db";
import { MigrationStatusResponse } from "../domain/migration-status";
import { apiHost } from "../config";

export async function getAggregatedMetrics(targetStep?: string): Promise<GetMetricsResponse> {
  const step = targetStep || "01:00:00";
  return (await axios.get(`${apiHost}/api/v1/j2g/metrics/aggregated`, { params: { step }})).data;
}

export async function getMigrations(): Promise<Migration[]> {
  return (await axios.get(`${apiHost}/api/v1/j2g/migrations`)).data;
}

export async function getMigration(name: string): Promise<Migration[]> {
  return (await axios.get(`${apiHost}/api/v1/j2g/migrations/${name}`)).data;
}

export async function getMigrationStatus(name: string): Promise<MigrationStatusResponse> {
  return (await axios.get(`${apiHost}/api/v1/j2g/migrations/${name}/status`)).data;
}

export async function createMigration(req: CreateNewMigrationParameters): Promise<Migration> {
  return (await axios.post(`${apiHost}/api/v1/j2g/migrations`, req)).data;
}

export async function listCollections(req: GetCollectionsForMongoDb): Promise<string[]> {
  return (await axios.post(`${apiHost}/api/v1/j2g/collections/list`, req)).data;
}

export async function listDatabases(req: GetDatabasesForMongoDb): Promise<string[]> {
  return (await axios.post(`${apiHost}/api/v1/j2g/databases/list`, req)).data;
}

export async function start(migrationName: string): Promise<string[]> {
  return (await axios.put(`${apiHost}/api/v1/j2g/migrations/${migrationName}/start`)).data;
}

export async function pause(migrationName: string): Promise<string[]> {
  return (await axios.put(`${apiHost}/api/v1/j2g/migrations/${migrationName}/pause`)).data;
}

export async function stop(migrationName: string): Promise<string[]> {
  return (await axios.put(`${apiHost}/api/v1/j2g/migrations/${migrationName}/stop`)).data;
}
