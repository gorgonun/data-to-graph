import { Stack, Typography } from "@mui/material";
import React from "react";
import Link from "next/link";
import { useVisibleSections } from "@/hooks/useVisibleSections";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface DocumentationTOCProps {
  variant?: "default" | "minimal";
}

export default function DocumentationTOC({
  variant = "default",
}: DocumentationTOCProps) {
  const scrolledRef = React.useRef(false);
  const [headingInfo, setHeadingInfo] = React.useState<
    { id: string; tagName: string; text: string | null; level: number }[]
  >([]);
  const [isOpen, setIsOpen] = React.useState(false);
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
    if (variant === "minimal") {
      return { fontWeight: 0 };
    }
    if (visibleHeadings?.length > 0) {
      const index = visibleHeadings.indexOf(id);
      if (index < 0) {
        return { fontWeight: 0, color: "gray" };
      } else if (index === 0) {
        return { fontWeight: 700 };
      }

      return { fontWeight: 0 };
    }

    return { fontWeight: 0, color: "gray" };
  };

  return (
    <Stack>
      <Stack direction="row">
        {variant === "minimal" ? (
          isOpen ? (
            <KeyboardArrowUpIcon onClick={() => setIsOpen(false)} />
          ) : (
            <KeyboardArrowDownIcon onClick={() => setIsOpen(true)} />
          )
        ) : (
          <></>
        )}
        <Typography>On this page</Typography>
      </Stack>
      <Stack>
        {variant !== "minimal" || isOpen ? (
          headingInfo.map((heading) => {
            const fontStyle = getFontStyle(heading.id);

            return (
              <Stack key={heading.id} spacing={1} ml={(heading.level - 1) * 2}>
                <Link
                  href={`#${heading.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    fontSize="0.7em"
                    color="black"
                    fontWeight={fontStyle.fontWeight}
                    style={{ color: fontStyle.color ?? "black" }}
                  >
                    {heading.text}
                  </Typography>
                </Link>
              </Stack>
            );
          })
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
}
