import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { MigrationDataModal } from "./modals/MigrationDataModal";
import { useEffect, useState } from "react";
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowSharpIcon from "@mui/icons-material/PlayArrowSharp";
import { Migration, MigrationWithExtraFields } from "../domain/migration";
import {
  getMigrationStatus,
  getMigrations,
  pause,
  start,
  stop,
} from "../api/j2g-api";
import { calculateExtraMigrationFields } from "../helpers/calculate-extra-migration-fields";
import AddIcon from "@mui/icons-material/Add";
import { CreateMigrationModal } from "./modals/CreateMigrationModal";
import { MigrationStatusResponse } from "../domain/migration-status";

export default function Migrations() {
  const [openMigrationModal, setOpenMigrationModal] = useState(false);
  const [selectMigrationData, setSelectMigrationData] =
    useState<Migration | null>(null);

  const [migrations, setMigrations] = useState<MigrationWithExtraFields[]>([]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const [refetchData, setRefetchData] = useState<boolean>(false);
  const [openCreateNewMigrationModal, setOpenCreateNewMigrationModal] =
    useState<boolean>(false);

  const [startingMigration, setStartingMigration] = useState<string | null>(
    null
  );

  const [statusRefetchTimeMills, setStatusRefetchTimeMills] = useState(1000);
  const [migrationStatus, setMigrationStatus] = useState<{
    [migrationName: string]: MigrationStatusResponse;
  } | null>(null);
  const [migrationReplicas, setMigrationReplicas] = useState<{
    [migrationName: string]: number;
  } | null>(null);

  useEffect(() => {
    const getAllMigrationStatus = () => {
      migrations.forEach((migration) => {
        getMigrationStatus(migration.migration_name).then((status) => {
          setMigrationStatus((prev) => ({
            ...prev,
            [migration.migration_name]: status,
          }));
        });
      });
    };

    getAllMigrationStatus();

    const interval = setInterval(getAllMigrationStatus, statusRefetchTimeMills);
    return () => clearInterval(interval);
  }, [statusRefetchTimeMills, migrations]);

  useEffect(() => {
    if (!dataFetched || refetchData) {
      getMigrations().then((data) => {
        setMigrations(data.map(calculateExtraMigrationFields));
      });

      setRefetchData(false);
      setDataFetched(true);
    }
  }, [dataFetched, refetchData]);

  useEffect(() => {
    if (migrationStatus) {
      const replicas = migrations.reduce((acc, migration) => {
        acc[migration.migration_name] = Object.values(
          migrationStatus[migration.migration_name]
        )
          .map((status) => status.replicas)
          .reduce((a, b) => a + b, 0);
        return acc;
      }, {} as { [migrationName: string]: number });

      setMigrationReplicas(replicas);
    }
  }, [migrationStatus]);

  const startMigration = async (migrationName: string) => {
    setStartingMigration(migrationName);

    await start(migrationName);

    setRefetchData(true);
    setStartingMigration(null);
  };

  const someStepIsNotRunning = (migration: MigrationWithExtraFields) => {
    return (
      migration.mongodb_producer_replicas === 0 ||
      migration.json_to_node_replicas === 0 ||
      migration.node_to_neo4j_replicas === 0 ||
      migration.neo4j_create_relationship_replicas === 0
    );
  };

  return (
    <Stack>
      <Stack alignItems="center">
        <Typography variant="h4">Migrations</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" mt={4}>
        <Box>
          <Button onClick={() => setOpenCreateNewMigrationModal(true)}>
            <AddIcon sx={{ color: "black" }} fontWeight={700} />
            <Box>
              <Typography sx={{ color: "black" }} fontWeight={700}>
                Add new migration
              </Typography>
            </Box>
          </Button>
        </Box>
      </Stack>
      <Box mt={2}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Replicas</TableCell>
                <TableCell align="right">Manage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {migrations.map((migration) => {
                const replicas = migrationReplicas?.[migration.migration_name] ?? migration.replicas;

                return (
                  <TableRow
                    key={migration.migration_name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Button
                        color="inherit"
                        sx={{ padding: 0 }}
                        onClick={() => {
                          setSelectMigrationData(migration);
                          setOpenMigrationModal(true);
                        }}
                      >
                        {migration.migration_name}
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      {migration.migration_type}
                    </TableCell>
                    <TableCell align="right">
                      {migrationReplicas?.[migration.migration_name] ??
                        migration.replicas}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        flexGrow={1}
                      >
                        {startingMigration === migration.migration_name && (
                          <Stack p={1}>
                            <CircularProgress
                              size="24px"
                              sx={{ color: "green" }}
                            />
                          </Stack>
                        )}
                        {!(startingMigration === migration.migration_name) && (
                          <IconButton
                            disabled={
                              replicas > 0 &&
                              !someStepIsNotRunning(migration)
                            }
                            onClick={() =>
                              startMigration(migration.migration_name)
                            }
                          >
                            <PlayArrowSharpIcon
                              sx={{
                                color:
                                  replicas === 0
                                    ? "lightGray"
                                    : "green",
                                "&:hover": {
                                  color: "green",
                                },
                              }}
                            />
                          </IconButton>
                        )}
                        <IconButton
                          sx={{ color: "gray" }}
                          disabled={replicas === 0}
                          onClick={() => pause(migration.migration_name)}
                        >
                          <PauseIcon />
                        </IconButton>
                        <IconButton
                          sx={{ color: "red" }}
                          disabled={replicas === 0}
                          onClick={() => stop(migration.migration_name)}
                        >
                          <StopIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {openMigrationModal && selectMigrationData && (
        <MigrationDataModal
          migrationData={selectMigrationData}
          onClose={() => setOpenMigrationModal(false)}
        />
      )}
      {openCreateNewMigrationModal && (
        <CreateMigrationModal
          onClose={() => setOpenCreateNewMigrationModal(false)}
          afterNewMigrationCreated={() => setRefetchData(true)}
        />
      )}
    </Stack>
  );
}
