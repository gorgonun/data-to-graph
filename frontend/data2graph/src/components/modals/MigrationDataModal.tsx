import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CustomIconButton from "../CustomIconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Migration } from "../../domain/migration";

interface Props {
  migrationData: Migration;
  onClose: () => void;
}

export const MigrationDataModal = ({
  migrationData: { migration_name, migration_type },
  onClose,
}: Props) => {
  const [newName, setNewName] = useState(migration_name);

  return (
    <Modal open={true} onClose={onClose}>
      <Stack
        sx={{
          minWidth: 400,
          minHeight: 400,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Stack alignItems="end">
          <CustomIconButton icon={<CloseIcon />} onClick={onClose} />
        </Stack>
        <Stack alignItems='center'>
          <Typography variant="h6">Migration</Typography>
        </Stack>
        <Stack mt={6}>
          <Box display="flex" justifyContent="space-between" alignItems='center'>
            <Typography fontSize={14} fontWeight={600}>
              Name:
            </Typography>
            <TextField
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              variant='standard'
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems='center' mt={2}>
            <Typography fontSize={14} fontWeight={600}>
              Type:
            </Typography>
            <Typography fontSize={14}>{migration_type}</Typography>
          </Box>
        </Stack>
        <Stack flexDirection="column-reverse" flexGrow={1} height="100%">
          <Button
            onClick={() => {
              onClose();
            }}
          >
            Apply
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
