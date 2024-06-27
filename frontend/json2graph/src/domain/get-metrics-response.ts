export interface MetricValue {
    timestamp: number;
    value: string;
}

export interface MetricResult {
    labels: Record<string, string>;
    values: MetricValue[];
}

export interface GetMetricsResponse {
    nodes_created_rate: MetricResult[];
    relationship_created_rate: MetricResult[];
    nodes_created_total: MetricResult[];
    relationship_created_total: MetricResult[];
    chart_relationship_created_total_per_job_instance: MetricResult[];
}
