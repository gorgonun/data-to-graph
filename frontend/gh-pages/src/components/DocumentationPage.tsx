import { Stack, Grid, Typography } from "@mui/material";
import React from "react";
import { ReactNode } from "react";
import DocsNavBar from "./DocsNavBar";
import Link from "next/link";
import { useVisibleSections } from "@/hooks/useVisibleSections";

type Props = {
  children?: ReactNode;
  pages: string[];
};

export default function DocumentationPage({ children, pages }: Props) {
  const scrolledRef = React.useRef(false);
  const [headingInfo, setHeadingInfo] = React.useState<
    { id: string; tagName: string; text: string | null; level: number }[]
  >([]);
  const visibleHeadings = useVisibleSections(headingInfo.map((h) => h.id));

  React.useEffect(() => {
    const hash = window.location.hash;

    if (hash && !scrolledRef.current) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        scrolledRef.current = true;
      }
    }
  }, []);

  React.useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    const headingInfo = [];

    for (const heading of headings) {
      const id = heading.id;
      const tagName = heading.tagName;
      const text = heading.textContent;
      const level = parseInt(tagName.replace("H", ""), 10);

      if (text !== "#") {
        headingInfo.push({ id, tagName, text, level });
      }
    }

    setHeadingInfo(headingInfo);
  }, []);

  const getFontStyle = (id: string) => {
    if (visibleHeadings?.length > 0) {
      const index = visibleHeadings.indexOf(id);
      if (index < 0) {
        return { fontWeight: 0, color: "gray" };
      } else if (index === 0) {
        return { fontWeight: 700 };
      }

      return { fontWeight: 0 };
    }

    return { fontWeight: 0, color: "gray"  };
  };

  return (
    <Stack sx={{ width: "100%", maxWidth: "lg", mx: "auto" }}>
      <Grid width="100%" container mt={5}>
        <Grid item xs={2}>
          <Stack position="sticky" top={10}>
            <DocsNavBar pages={pages.map((p) => ({ name: p }))} />
          </Stack>
        </Grid>
        <Grid
          item
          xs={7}
          sx={{
            ".hljs": {
              maxWidth: "100%",
              overflowX: "",
            },
          }}
        >
          {children}
        </Grid>
        <Grid item xs={3}>
          <Stack ml={2} position="sticky" top={10}>
            <Typography>On this page</Typography>
            {headingInfo.map((heading) => {
              const fontStyle = getFontStyle(heading.id);

              return (
                <Stack
                  key={heading.id}
                  spacing={1}
                  ml={(heading.level - 1) * 2}
                >
                  <Link
                    href={`#${heading.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography
                      fontSize="0.7em"
                      color="black"
                      fontWeight={fontStyle.fontWeight}
                      style={{ color: fontStyle.color ?? 'black' }}
                    >
                      {heading.text}
                    </Typography>
                  </Link>
                </Stack>
              );
            })}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
