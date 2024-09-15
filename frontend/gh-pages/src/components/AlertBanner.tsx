import { Alert } from "@/Providers/AlertContext";
import { Box, Stack, alpha, IconButton, Typography } from "@mui/material";

interface AlertBannerProps {
  alert: Alert;
  onClose: () => void;
}

export function AlertBanner({ alert, onClose }: AlertBannerProps) {
  const severityBackground = {
    error: "#FF0000",
    warning: "#FFFF00",
    info: "#ADD8E6",
  }[alert.severity];

  return (
    <Stack alignItems="center" mt={1}>
      <Box width="100%" maxWidth="lg" mx="auto">
        <Stack p={1} direction="row" justifyContent='center' sx={{ backgroundColor: alpha(severityBackground, 0.2) }}>
          <Box>
            <Typography fontSize='0.7em'>{alert.message}</Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
