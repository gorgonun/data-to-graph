"use client" 
import {
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import InsightsIcon from "@mui/icons-material/Insights";
import SpaIcon from "@mui/icons-material/Spa";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import BarChartIcon from "@mui/icons-material/BarChart";

const iconMap = {
  article: (props: SxProps) => (
    <ArticleIcon color="primary" sx={{ ...props }} />
  ),
  insights: (props: SxProps) => (
    <InsightsIcon color="primary" sx={{ ...props }} />
  ),
  spa: (props: SxProps) => <SpaIcon color="primary" sx={{ ...props }} />,
  directionsBoat: (props: SxProps) => (
    <DirectionsBoatIcon color="primary" sx={{ ...props }} />
  ),
  barChart: (props: SxProps) => (
    <BarChartIcon color="primary" sx={{ ...props }} />
  ),
};

export interface MessageBlockProps {
  title: string;
  message: string;
  icon: keyof typeof iconMap;
}

export function MessageBlock({ title, message, icon }: MessageBlockProps) {
  const globalIconProps: SxProps = {
    fontSize: "4rem",
  };

  const iconComponent = iconMap[icon](globalIconProps);

  return (
    <Stack p={4}>
      <Stack alignItems="center">{iconComponent}</Stack>
      <Stack mt={2}>
        <Typography
          variant="h6"
          fontFamily="oxygenMono"
          fontWeight={700}
          color="primary"
        >
          {title}
        </Typography>
        <Typography>{message}</Typography>
      </Stack>
    </Stack>
  );
}
