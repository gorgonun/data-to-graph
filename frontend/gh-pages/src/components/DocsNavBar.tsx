import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";

interface DocsNavBarProps {
  pages: { name: string; id: string }[];
  currentPageId: string;
}

export default function DocsNavBar({ pages, currentPageId }: DocsNavBarProps) {
  return (
    <Stack direction="column">
      {pages.map(({ name, id }) => (
        <Link
          key={name}
          href={{ pathname: `/documentation/[id]`, query: { id: id } }}
        >
          <Button variant="text">
            <Typography
              fontSize="0.7em"
              color={id === currentPageId ? "primary" : "black"}
              fontWeight={700}
            >
              {name}
            </Typography>
          </Button>
        </Link>
      ))}
    </Stack>
  );
}
