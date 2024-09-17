import { Button, Stack } from "@mui/material";
import Link from "next/link";

interface DocsNavBarProps {
  pages: { name: string }[];
}

export default function DocsNavBar({ pages }: DocsNavBarProps) {
  return (
    <Stack direction="column" spacing={1}>
      {pages.map(({ name }) => (
        <Link key={name} href={{ pathname: `/documentation/[id]`, query: { id: name }}}>
          <Button variant="text">{name}</Button>
        </Link>
      ))}
    </Stack>
  );
}
