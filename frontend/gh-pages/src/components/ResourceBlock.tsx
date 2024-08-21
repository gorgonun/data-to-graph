import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

export interface ResourceBlockProps {
  title: string;
  message: string;
  image: string;
  alt: string;
  direction: "left" | "right";
  size: "small" | "medium" | "large" | "xlarge";
}

export function ResourceBlock({
  title,
  message,
  image,
  alt,
  direction,
  size,
}: ResourceBlockProps) {
  const theme = useTheme();
  const greaterThanSm = useMediaQuery(theme.breakpoints.up("sm"));

  const sizeMapping = {
    small: { xs: "60vw", md: "10vw" },
    medium: { xs: "75vw", md: "15vw" },
    large: { xs: "80vw", md: "20vw" },
    xlarge: { xs: "90vw", md: "30vw" },
  };

  const TextResource = (
    <Stack>
      <Stack>
        <Typography
          variant="h4"
          fontFamily="oxygenMono"
          fontWeight={700}
          color="secondary"
        >
          {title}
        </Typography>
      </Stack>
      <Stack>
        <Typography>{message}</Typography>
      </Stack>
    </Stack>
  );

  const ImageResource = (
    <Box
      component="img"
      alt={alt}
      src={image}
      sx={{
        maxWidth: sizeMapping[size],
        borderRadius: { xs: 1, md: "10px" },
        boxShadow: 2,
        ml: greaterThanSm ? (direction === "left" ? 0 : 3) : 0,
        mr: greaterThanSm ? (direction === "right" ? 3 : 0) : 0,
      }}
    />
  );

  return greaterThanSm ? (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {direction === "left" ? TextResource : ImageResource}
      {direction === "right" ? TextResource : ImageResource}
    </Stack>
  ) : (
    <Stack direction="column" alignItems="center">
      <Box mb={5}>{ImageResource}</Box>
      <Stack>{TextResource}</Stack>
    </Stack>
  );
}
