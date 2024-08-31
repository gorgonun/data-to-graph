import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CustomIconButton from "../CustomIconButton";
import CloseIcon from "@mui/icons-material/Close";
import { CreateNewMigrationParameters } from "../../domain/create-new-migration-parameters";
import { GetCollectionsForMongoDb } from "../../domain/get-collections-for-mongo-db";
import {
  createMigration,
  listCollections,
  listDatabases,
} from "../../api/j2g-api";
import CheckIcon from "@mui/icons-material/Check";
import { MigrationType } from "../../domain/migration-type";
import { isValidString } from "../../helpers/string_helpers";
import { GetDatabasesForMongoDb } from "../../domain/get-databases-for-mongo-db";

interface Props {
  onClose: () => void;
  afterNewMigrationCreated?: () => void;
}

export const CreateMigrationModal = ({
  onClose,
  afterNewMigrationCreated,
}: Props) => {
  const [newMigrationData, setNewMigrationData] =
    useState<CreateNewMigrationParameters | null>(null);
  const [migrationCreationStatus, setMigrationCreationStatus] = useState<
    "creating" | "error" | "success" | null
  >(null);

  const createNewMigration = async (data: CreateNewMigrationParameters) => {
    setMigrationCreationStatus("creating");
    try {
      await createMigration(data);
    } catch (e) {
      setMigrationCreationStatus("error");
      console.error(e);
      return;
    }

    setMigrationCreationStatus("success");
    afterNewMigrationCreated?.();
  };

  const setCreateNewMigrationData = async (
    data: CreateNewMigrationParameters
  ) => {
    setNewMigrationData(data);
    await createNewMigration(data);
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Stack
        sx={{
          minWidth: "50vw",
          minHeight: "60vh",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
        id="modal-base"
      >
        <Stack id="modal-information" flexGrow={1}>
          <Stack alignItems="end" id="close-icon">
            <CustomIconButton icon={<CloseIcon />} onClick={onClose} />
          </Stack>
          <Stack id="modal-screen" flexGrow={1}>
            {migrationCreationStatus === null && (
              <NewMigrationScreen
                setNewMigrationData={setCreateNewMigrationData}
              />
            )}
            {migrationCreationStatus === "creating" && (
              <CreatingMigrationScreen
                migrationName={newMigrationData?.migration_name ?? ""}
              />
            )}
            {migrationCreationStatus === "success" && (
              <MigrationCreatedScreen
                migrationName={newMigrationData?.migration_name ?? ""}
              />
            )}
            {migrationCreationStatus === "error" && (
              <MigrationCreationErrorScreen
                migrationName={newMigrationData?.migration_name ?? ""}
              />
            )}
          </Stack>
          <Box mt={2}>
            <Button onClick={onClose} fullWidth>
              Close
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Modal>
  );
};

interface NewMigrationScreenProps {
  setNewMigrationData: (data: CreateNewMigrationParameters) => void;
}

const NewMigrationScreen = ({
  setNewMigrationData,
}: NewMigrationScreenProps) => {
  const [newPartialMigrationData, setNewPartialMigrationData] = useState<
    Partial<CreateNewMigrationParameters>
  >({ migration_type: MigrationType.ONE_TIME });

  const [value, setValue] = useState(0);

  const isDataValid = () => {
    return (
      isValidString(newPartialMigrationData.migration_name) &&
      isValidString(newPartialMigrationData.mongodb_url) &&
      isValidString(newPartialMigrationData.mongodb_database) &&
      isValidString(newPartialMigrationData.mongodb_collection) &&
      newPartialMigrationData.migration_type
    );
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
    };
  }

  const tabByValue = new Map([
    [
      0,
      [
        <NewMigrationScreenDatabaseDataTab
          mongoDbUrl={newPartialMigrationData.mongodb_url ?? null}
          databaseName={newPartialMigrationData.mongodb_database ?? null}
          collectionName={newPartialMigrationData.mongodb_collection ?? null}
          onMongoDbUrlChange={(mongodb_url) => {
            if (mongodb_url)
              setNewPartialMigrationData((prev) => ({ ...prev, mongodb_url }));
          }}
          onDatabaseNameChange={(mongodb_database) => {
            if (mongodb_database)
              setNewPartialMigrationData((prev) => ({
                ...prev,
                mongodb_database,
              }));
          }}
          onCollectionNameChange={(mongodb_collection) => {
            if (mongodb_collection)
              setNewPartialMigrationData((prev) => ({
                ...prev,
                mongodb_collection,
              }));
          }}
        />,
        "Create a Migration",
      ],
    ],
    [
      1,
      [
        <NewMigrationScreenMigrationDataTab
          name={newPartialMigrationData.migration_name ?? null}
          migrationType={
            newPartialMigrationData.migration_type ?? MigrationType.ONE_TIME
          }
          rootDatabaseName={newPartialMigrationData.root_database_name ?? null}
          onNameChange={(migration_name) =>
            setNewPartialMigrationData((prev) => ({ ...prev, migration_name }))
          }
          onMigrationTypeChange={(migration_type) =>
            setNewPartialMigrationData((prev) => ({ ...prev, migration_type }))
          }
          onRootDatabaseNameChange={(root_database_name) =>
            setNewPartialMigrationData((prev) => ({
              ...prev,
              root_database_name,
            }))
          }
        />,
        "Mongo DB Connection data",
      ],
    ],
    [
      2,
      [
        <NewMigrationScreenAdvancedSettingsTab
          mongodbProducerReplicas={
            newPartialMigrationData.mongodb_producer_replicas
          }
          jsonToNodeReplicas={newPartialMigrationData.json_to_node_replicas}
          nodeToNeo4jReplicas={newPartialMigrationData.node_to_neo4j_replicas}
          neo4jCreateRelationshipReplicas={
            newPartialMigrationData.neo4j_create_relationship_replicas
          }
          onMongodbProducerReplicasChange={(mongodb_producer_replicas) =>
            setNewPartialMigrationData((prev) => ({
              ...prev,
              mongodb_producer_replicas,
            }))
          }
          onJsonToNodeReplicasChange={(json_to_node_replicas) =>
            setNewPartialMigrationData((prev) => ({
              ...prev,
              json_to_node_replicas,
            }))
          }
          onNodeToNeo4jReplicasChange={(node_to_neo4j_replicas) =>
            setNewPartialMigrationData((prev) => ({
              ...prev,
              node_to_neo4j_replicas,
            }))
          }
          onNeo4jCreateRelationshipReplicasChange={(
            neo4j_create_relationship_replicas
          ) =>
            setNewPartialMigrationData((prev) => ({
              ...prev,
              neo4j_create_relationship_replicas,
            }))
          }
        />,
        "Advanced settings",
      ],
    ],
  ]);

  const [page, title] = tabByValue.get(value) ?? [null, ""];

  return (
    <Stack flexGrow={1}>
      <Stack direction="row" flexGrow={1} justifyContent="space-between">
        <Stack>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Create Migration tabs"
            sx={{
              borderRight: 1,
              borderColor: "divider",
              flexGrow: 1,
              justifyContent: "space-between",
            }}
          >
            <Tab label="Database" {...a11yProps(0)} />
            <Tab label="Migration" {...a11yProps(1)} />
            <Tab label="Advanced Settings" {...a11yProps(2)} />
          </Tabs>
        </Stack>
        <Stack flexGrow={1} ml={3}>
          <Stack alignItems="center">
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <Stack mt={6}>{page}</Stack>
        </Stack>
      </Stack>
      <Stack flexDirection="column-reverse" mt={4}>
        <Button
          onClick={() => {
            setNewMigrationData(
              newPartialMigrationData as CreateNewMigrationParameters
            );
          }}
          disabled={!isDataValid()}
        >
          Create
        </Button>
      </Stack>
    </Stack>
  );
};

interface NewMigrationScreenMigrationDataTabProps {
  name: string | null;
  migrationType: MigrationType;
  rootDatabaseName: string | null;
  onNameChange: (name: string) => void;
  onMigrationTypeChange: (migrationType: MigrationType) => void;
  onRootDatabaseNameChange: (name: string) => void;
}

const NewMigrationScreenMigrationDataTab = ({
  name,
  migrationType,
  rootDatabaseName,
  onNameChange,
  onMigrationTypeChange,
  onRootDatabaseNameChange,
}: NewMigrationScreenMigrationDataTabProps) => {
  return (
    <Stack>
      <Stack>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box mr={3}>
            <Typography fontSize={14} fontWeight={600}>
              Name*:
            </Typography>
          </Box>
          <Box>
            <TextField
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              variant="standard"
              sx={{ minWidth: "20vw" }}
            />
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box mr={3}>
            <Typography fontSize={14} fontWeight={600}>
              Migration type*:
            </Typography>
          </Box>
          <FormControl variant="standard" sx={{ minWidth: "20vw" }}>
            <Select
              value={migrationType}
              label="Migration type"
              onChange={(event) =>
                onMigrationTypeChange(event.target.value as MigrationType)
              }
            >
              {Object.values(MigrationType).map((migrationType) => (
                <MenuItem key={migrationType} value={migrationType}>
                  {migrationType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box mr={3}>
            <Typography fontSize={14} fontWeight={600}>
              Root Database Name:
            </Typography>
          </Box>
          <TextField
            value={rootDatabaseName}
            onChange={(event) => onRootDatabaseNameChange(event.target.value)}
            variant="standard"
            sx={{ minWidth: "20vw" }}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

interface NewMigrationScreenDatabaseDataTabProps {
  mongoDbUrl: string | null;
  databaseName: string | null;
  collectionName: string | null;
  onMongoDbUrlChange: (url: string) => void;
  onDatabaseNameChange: (name: string | null) => void;
  onCollectionNameChange: (name: string | null) => void;
}

const NewMigrationScreenDatabaseDataTab = ({
  mongoDbUrl,
  databaseName,
  collectionName,
  onMongoDbUrlChange,
  onDatabaseNameChange,
  onCollectionNameChange,
}: NewMigrationScreenDatabaseDataTabProps) => {
  const [mongodbConnectionStatus, setMongodbConnectionStatus] = useState<
    "error" | "success" | null
  >(null);

  const [connectionErrorReason, setConnectionErrorReason] =
    useState<string>("");

  const [testConnection, setTestConnection] = useState<boolean>(false);
  const [loadCollections, setLoadCollections] = useState<boolean>(false);

  const [collections, setCollections] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(false);
  const [loadingDatabases, setLoadingDatabases] = useState<boolean>(false);

  useEffect(() => {
    if (isValidString(mongoDbUrl) && isValidString(databaseName)) {
      setLoadingCollections(true);
      setMongodbConnectionStatus(null);

      listCollections({
        mongodb_url: mongoDbUrl,
        mongodb_database: databaseName,
      } as GetCollectionsForMongoDb).then(
        (data) => {
          setCollections(data);
          setLoadingCollections(false);
          setMongodbConnectionStatus("success");
          setTestConnection(false);
        },
        (r) => {
          setLoadingCollections(false);
          setMongodbConnectionStatus("error");
          setConnectionErrorReason(r?.response?.data?.detail);
          setTestConnection(false);
        }
      );
    } else if (isValidString(mongoDbUrl) && !loadCollections) {
      setLoadingDatabases(true);
      setMongodbConnectionStatus(null);

      listDatabases({ mongodb_url: mongoDbUrl } as GetDatabasesForMongoDb).then(
        (data) => {
          setDatabases(data);
          setLoadingDatabases(false);
          setMongodbConnectionStatus("success");
          setTestConnection(false);
        },
        (r) => {
          setLoadingDatabases(false);
          setMongodbConnectionStatus("error");
          setConnectionErrorReason(r?.response?.data?.detail);
          setTestConnection(false);
        }
      );
    }
  }, [testConnection, loadCollections]);

  const setDatabase = (database: string | null) => {
    if (database) {
      onDatabaseNameChange(database);
      setLoadCollections(true);
    }
  };

  return (
    <Stack mt={2}>
      <Stack>
        <Stack>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontSize={14} fontWeight={600}>
              Mongodb url*:
            </Typography>
            {(loadingCollections || loadingDatabases) && (
              <Box mx={1}>
                <CircularProgress size={16} />
              </Box>
            )}
            {mongodbConnectionStatus === "success" && (
              <Box mx={1}>
                <CheckIcon sx={{ color: "green" }} />
              </Box>
            )}
            {mongodbConnectionStatus === "error" && (
              <Box mx={1}>
                <CloseIcon sx={{ color: "red" }} />
              </Box>
            )}
            <TextField
              value={mongoDbUrl}
              onChange={(event) => onMongoDbUrlChange(event.target.value)}
              variant="standard"
              sx={{ minWidth: "20vw" }}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center">
              <Typography fontSize={14} fontWeight={600} display="inline">
                Mongodb database*
              </Typography>
            </Stack>
            {(loadingDatabases ||
              mongodbConnectionStatus === null ||
              mongodbConnectionStatus === "error" ||
              (mongodbConnectionStatus === "success" &&
                databases.length === 0)) && (
              <TextField
                value={databaseName}
                variant="standard"
                sx={{ minWidth: "20vw" }}
                onChange={(event) => onDatabaseNameChange(event.target.value)}
              />
            )}
            {mongodbConnectionStatus === "success" && databases.length > 0 && (
              <FormControl variant="standard" sx={{ minWidth: "20vw" }}>
                <Select
                  value={databaseName}
                  label="Database"
                  onChange={(event) => setDatabase(event.target.value)}
                >
                  {databases.map((database) => (
                    <MenuItem key={database} value={database}>
                      {database}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontSize={14} fontWeight={600}>
              Mongodb collection*:
            </Typography>
            {(loadingCollections ||
              mongodbConnectionStatus === null ||
              mongodbConnectionStatus === "error" ||
              (mongodbConnectionStatus === "success" &&
                collections.length === 0)) && (
              <TextField
                value={collectionName}
                variant="standard"
                sx={{ minWidth: "20vw" }}
                onChange={(event) => onCollectionNameChange(event.target.value)}
              />
            )}
            {mongodbConnectionStatus === "success" &&
              collections.length > 0 && (
                <FormControl variant="standard" sx={{ minWidth: "20vw" }}>
                  <Select
                    value={collectionName}
                    label="Collection"
                    onChange={(event) =>
                      onCollectionNameChange(event.target.value)
                    }
                  >
                    {collections.map((collection) => (
                      <MenuItem key={collection} value={collection}>
                        {collection}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
          </Box>
        </Stack>
        <Stack alignItems="flex-end" my={2}>
          <Button
            variant="outlined"
            onClick={() => setTestConnection(true)}
            sx={{ width: "fit-content" }}
            disabled={
              !isValidString(mongoDbUrl) ||
              loadingCollections ||
              loadingDatabases
            }
          >
            Test connection
          </Button>
        </Stack>
      </Stack>
      <Stack mt={4}>
        <Box sx={{ backgroundColor: "lightGray" }}>
          {(loadingCollections ||
            loadingDatabases ||
            mongodbConnectionStatus === "error" ||
            mongodbConnectionStatus === "success") && (
            <Box>
              <Typography fontSize={14} fontWeight={600}>
                logs:
              </Typography>
            </Box>
          )}
          {(loadingCollections || loadingDatabases) && (
            <Stack direction="row" alignItems="center">
              <Box mx={1}>
                <CircularProgress size={16} />
              </Box>
              <Typography>
                Trying to connect to database {databaseName}
              </Typography>
            </Stack>
          )}
          {mongodbConnectionStatus === "success" && (
            <Stack direction="row">
              <Box mx={1}>
                <CheckIcon sx={{ color: "green" }} />
              </Box>
              <Typography>
                Success with mongo db connection on database {databaseName}
              </Typography>
            </Stack>
          )}
          {mongodbConnectionStatus === "error" && (
            <Stack direction="row">
              <Box mx={1}>
                <CloseIcon sx={{ color: "red" }} />
              </Box>
              <Stack>
                <Box>
                  <Typography>
                    Failure while trying to connect to database {databaseName}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography>Reason: {connectionErrorReason}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

interface NewMigrationScreenAdvancedSettingsTabProps {
  mongodbProducerReplicas?: number;
  jsonToNodeReplicas?: number;
  nodeToNeo4jReplicas?: number;
  neo4jCreateRelationshipReplicas?: number;
  onMongodbProducerReplicasChange: (replicas: number) => void;
  onJsonToNodeReplicasChange: (replicas: number) => void;
  onNodeToNeo4jReplicasChange: (replicas: number) => void;
  onNeo4jCreateRelationshipReplicasChange: (replicas: number) => void;
}

const NewMigrationScreenAdvancedSettingsTab = ({
  mongodbProducerReplicas,
  jsonToNodeReplicas,
  nodeToNeo4jReplicas,
  neo4jCreateRelationshipReplicas,
  onMongodbProducerReplicasChange,
  onJsonToNodeReplicasChange,
  onNodeToNeo4jReplicasChange,
  onNeo4jCreateRelationshipReplicasChange,
}: NewMigrationScreenAdvancedSettingsTabProps) => {
  return (
    <Box flexGrow={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14} fontWeight={600}>
          Mongodb Producer Replicas:
        </Typography>
        <TextField
          value={mongodbProducerReplicas}
          onChange={(event) =>
            onMongodbProducerReplicasChange(Number.parseInt(event.target.value))
          }
          variant="standard"
          sx={{ minWidth: "20vw" }}
          type="number"
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14} fontWeight={600}>
          Json to Node Replicas:
        </Typography>
        <TextField
          value={jsonToNodeReplicas}
          onChange={(event) =>
            onJsonToNodeReplicasChange(Number.parseInt(event.target.value))
          }
          variant="standard"
          sx={{ minWidth: "20vw" }}
          type="number"
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14} fontWeight={600}>
          Node to Neo4j Replicas:
        </Typography>
        <TextField
          value={nodeToNeo4jReplicas}
          onChange={(event) =>
            onNodeToNeo4jReplicasChange(Number.parseInt(event.target.value))
          }
          variant="standard"
          sx={{ minWidth: "20vw" }}
          type="number"
        />
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={14} fontWeight={600}>
          Neo4j Create Relationship Replicas:
        </Typography>
        <TextField
          value={neo4jCreateRelationshipReplicas}
          onChange={(event) =>
            onNeo4jCreateRelationshipReplicasChange(
              Number.parseInt(event.target.value)
            )
          }
          variant="standard"
          sx={{ minWidth: "20vw" }}
          type="number"
        />
      </Box>
    </Box>
  );
};

interface CreatingMigrationScreenProps {
  migrationName: string;
}

const CreatingMigrationScreen = ({
  migrationName,
}: CreatingMigrationScreenProps) => {
  return (
    <Stack flexGrow={1}>
      <Stack alignItems="center">
        <Typography variant="h6">Creating Migration {migrationName}</Typography>
      </Stack>
      <Stack alignItems="center" flexGrow={1} justifyContent="center">
        <CircularProgress sx={{ fontSize: "10vh" }} />
      </Stack>
    </Stack>
  );
};

interface MigrationCreatedScreenProps {
  migrationName: string;
}

const MigrationCreatedScreen = ({
  migrationName,
}: MigrationCreatedScreenProps) => {
  return (
    <Stack flexGrow={1}>
      <Stack alignItems="center">
        <Typography variant="h6">
          Migration {migrationName} created successfully
        </Typography>
      </Stack>
      <Stack alignItems="center" flexGrow={1} justifyContent="center">
        <CheckIcon sx={{ color: "green", fontSize: "10vh" }} />
      </Stack>
    </Stack>
  );
};

interface MigrationCreationErrorScreenProps {
  migrationName: string;
}

const MigrationCreationErrorScreen = ({
  migrationName,
}: MigrationCreationErrorScreenProps) => {
  return (
    <Stack flexGrow={1}>
      <Stack alignItems="center">
        <Typography variant="h6">
          Migration {migrationName} could not be created
        </Typography>
      </Stack>
      <Stack alignItems="center" flexGrow={1} justifyContent="center">
        <CloseIcon sx={{ color: "red", fontSize: "10vh" }} />
      </Stack>
    </Stack>
  );
};
