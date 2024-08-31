export type MigrationStatus = {
  state: string;
  replicas: number;
};

export type MigrationStatusResponse = {
  [jobName: string]: MigrationStatus;
};
