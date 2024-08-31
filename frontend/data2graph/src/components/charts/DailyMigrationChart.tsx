import { LineChart } from "@tremor/react";

interface Props {
  data: {
    dimension: { name: string; value: string };
    metrics: { name: string; value: number }[];
  }[];
  categories: string[];
}

export function DailyMigrationChart({ data, categories }: Props) {
  return (
    <LineChart
      className="h-80"
      data={data.map(({ dimension, metrics }) => {
        return metrics
          .map(({ name, value }) => ({
            "date": dimension.value,
            [name]: value,
          }))
          .reduce((acc, curr) => ({ ...acc, ...curr }), {});
      })}
      index="date"
      categories={categories}
      yAxisWidth={60}
    />
  );
}
