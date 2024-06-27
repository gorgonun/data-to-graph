import axios from "axios";
import { JobInstanceDataRequest } from "../domain/job-instance-data-request";
import { apiHost } from "../config";

export async function getJobs(): Promise<string[]> {
  return (await axios.get(`${apiHost}/api/v1/jobs`)).data;
}

export async function getDefinitions(): Promise<any[]> {
  return (await axios.get(`${apiHost}/api/v1/definitions`)).data;
}

export async function create_job_instance(req: JobInstanceDataRequest): Promise<PositionDefinition> {
  return (await axios.post(`${apiHost}/api/v1/job_instances`, req)).data;
}

export async function scaleJobInstance(instanceId: string, replicas: number): Promise<PositionDefinition> {
  return (await axios.post(`${apiHost}/api/v1/jobs/${instanceId}/scale`, { replicas })).data;
}
