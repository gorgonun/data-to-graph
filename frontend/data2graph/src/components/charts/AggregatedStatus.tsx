import { BarList } from '@tremor/react';

interface Props {
    data: { name: string; value: number; }[];
}

export const AggregatedStatus = ({ data }: Props) => (
  <>
    <BarList data={data} className="mx-auto max-w-sm" />
  </>
);
