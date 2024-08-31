import { Card } from '@tremor/react';

interface Props {
    migrationName: string;
    migrationValue: number;
}


export default function AggregatedDailyTotalCard({ migrationName, migrationValue }: Props) {
  return (
    <Card className="mx-auto max-w-xs">
      <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {migrationName}
      </h4>
      <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        {migrationValue}
      </p>
    </Card>
  );
}
