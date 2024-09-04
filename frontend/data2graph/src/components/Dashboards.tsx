import { IconButton, Stack, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { DailyMigrationChart } from "./charts/DailyMigrationChart";
import AggregatedDailyTotalCard from "./charts/AggregatedDailyTotalCard";
import { AggregatedStatus } from "./charts/AggregatedStatus";
import { useEffect, useState } from "react";
import { GetMetricsResponse } from "../domain/get-metrics-response";
import { getAggregatedMetrics } from "../api/j2g-api";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const Dashboards = () => {
  const [metricsRefetchTimeMills] = useState(1000);
  const [metrics, setMetrics] = useState<GetMetricsResponse | null>(null);
  const [expandAllTime, setExpandAllTime] = useState(true);
  const [expandDailyMetrics, setExpandDailyMetrics] = useState(true);

  useEffect(() => {
    const getMetrics = () => {
      getAggregatedMetrics().then((metrics) => setMetrics(metrics));
    };

    getMetrics();

    const interval = setInterval(getMetrics, metricsRefetchTimeMills);
    return () => clearInterval(interval);
  }, [metricsRefetchTimeMills]);

  const nodeBySecondRate = +(metrics?.nodes_created_rate[0]?.values[0].value || 0);
  const relationsBySecondRate =
   +(metrics?.relationship_created_rate[0]?.values[0].value || 0);

  const [formattedChartData, allMigrationNames] = (() => {
    const aggregatedData = new Map<string, Map<string, number>>();
    const allMigrationNames = new Set<string>();

    for (const metric of metrics?.chart_relationship_created_total_per_job_instance ??
      []) {
      const labels = metric.labels;
      const values = metric.values;

      allMigrationNames.add(labels.migration_name ?? "unknown");

      for (const value of values) {
        const date = new Date(value.timestamp * 1000).toISOString();
        const data = new Map([
          [labels.migration_name ?? "unknown", Number.parseFloat(value.value)],
        ]);
        aggregatedData.set(
          date,
          new Map([...(aggregatedData.get(date) ?? []), ...data])
        );
      }
    }

    return [
      Array.from(aggregatedData.entries()).map(([date, data]) => {
        return {
          dimension: { name: "date", value: date },
          metrics: Array.from(data.entries()).map(([name, value]) => ({
            name,
            value,
          })),
        };
      }),
      allMigrationNames,
    ];
  })();

  const noDataAvailable = !metrics;

  return (
    <Stack>
      <Stack alignItems="center" mb={6}>
        <Typography variant="h4">Dashboards</Typography>
      </Stack>

      <Box sx={{ backgroundColor: 'white' }} mt={2}>
        <Box
          sx={{
            backgroundColor: "#8a549d20",
            borderRadius: "10px",
            border: "1px solid #000",
          }}
          p={4}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row">
              <Typography fontWeight={700}>All time</Typography>
              {questionMarkToolTip(
                "Metrics aggregated for all migrations since the beginning of the application"
              )}
            </Stack>
            <Box>
              <IconButton>
                {expandAllTime && (
                  <ExpandLessIcon onClick={() => setExpandAllTime(false)} />
                )}
                {!expandAllTime && (
                  <ExpandMoreIcon onClick={() => setExpandAllTime(true)} />
                )}
              </IconButton>
            </Box>
          </Stack>

          {expandAllTime && (
            <Box>
              <Box my={2}>
                <Divider />
              </Box>

              <Box p={4}>
                <Stack alignItems="center">
                  <Stack direction="row">
                    <Typography fontWeight={700}>Status</Typography>
                    {questionMarkToolTip(
                      "Rate of nodes migrated and relations created per second since the beginning of the application"
                    )}
                  </Stack>
                </Stack>
                <Stack mt={4}>
                  <Box>
                    <AggregatedStatus
                      data={[
                        { name: "Node by second", value: nodeBySecondRate },
                        {
                          name: "Relations by second",
                          value: relationsBySecondRate,
                        },
                      ]}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

        <Box sx={{ backgroundColor: 'white' }} mt={2}>
          <Box
            sx={{
              backgroundColor: "#549d6620",
              borderRadius: "10px",
              border: "1px solid #000",
            }}
            p={4}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row">
                <Typography fontWeight={700}>Daily metrics</Typography>
                {questionMarkToolTip(
                  "Daily metrics aggregated for all migrations"
                )}
              </Stack>
              <Box>
                <IconButton>
                  {expandDailyMetrics && (
                    <ExpandLessIcon onClick={() => setExpandDailyMetrics(false)} />
                  )}
                  {!expandDailyMetrics && (
                    <ExpandMoreIcon onClick={() => setExpandDailyMetrics(true)} />
                  )}
                </IconButton>
              </Box>
            </Stack>
            {expandDailyMetrics && (
              <Box>
                <Box my={2}>
                  <Divider />
                </Box>
                <Stack mt={2}>
                  <Box p={4}>
                    <Stack alignItems="center">
                      <Stack direction="row">
                        <Typography fontWeight={700}>Totals</Typography>
                        {questionMarkToolTip("Total migrations data")}
                      </Stack>
                    </Stack>
                    <Stack
                      mt={6}
                      minHeight="10vh"
                      {...(noDataAvailable
                        ? { alignItems: "center", direction: "column" }
                        : { direction: "row" })}
                    >
                      {metrics?.nodes_created_total.map((metric, index) => (
                        <AggregatedDailyTotalCard
                          key={`daily-total-card-${index}`}
                          migrationName={`Nodes for migration ${metric.labels.migration_name}`}
                          migrationValue={+metric.values[0].value}
                        />
                      ))}
                      {metrics?.relationship_created_total.map((metric, index) => (
                        <AggregatedDailyTotalCard
                          key={`daily-total-card-${index}`}
                          migrationName={`Relationship for migration ${metric.labels.migration_name}`}
                          migrationValue={+metric.values[0].value}
                        />
                      ))}
                      {noDataAvailable && (
                        <Box p={4}>
                          <Typography>No data available</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Box my={2}>
                    <Divider />
                  </Box>

                  <Box p={4}>
                    <Stack alignItems="center">
                      <Stack direction="row">
                        <Typography fontWeight={700}>
                          Daily records migrated
                        </Typography>
                        {questionMarkToolTip(
                          "Number of records migrated per day for each migration with 1 hour interval"
                        )}
                      </Stack>
                    </Stack>
                    <Box mt={2}>
                      <DailyMigrationChart
                        data={formattedChartData}
                        categories={Array.from(allMigrationNames)}
                      />
                    </Box>
                  </Box>

                  <Box></Box>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
    </Stack>
  );
};

const questionMarkToolTip = (message: string) => {
  return (
    <Tooltip title={message}>
      <Box ml={1}>
        <Typography color="gray" fontSize={12}>
          (?)
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default Dashboards;
