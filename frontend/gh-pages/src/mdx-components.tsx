import { Typography, Box, Stack, TypographyProps } from "@mui/material";
import type { MDXComponents } from "mdx/types";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/cjs/languages/hljs/bash";
import "highlight.js/styles/github.css";
import Link from "next/link";


SyntaxHighlighter.registerLanguage("bash", bash);

const headerWithAnchor = (headerProps: TypographyProps, id: string) => {
  return (
    <Stack direction="row" flexWrap='wrap' sx={{ ":hover": { ".link-icon": { opacity: 1 } } }}>
      <Typography {...headerProps} id={id} />
      <Box ml={1} className="link-icon" sx={{ opacity: 0 }}>
        <Link href={`#${id}`} style={{ textDecoration: "none" }}>
          <Typography
            variant={headerProps.variant}
            pb={headerProps.pb}
            fontSize={headerProps.fontSize}
            mt={headerProps.mt}
            color="primary"
          >
            #
          </Typography>
        </Link>
      </Box>
    </Stack>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ id, ...rest }) => (
      // @ts-ignore
      headerWithAnchor({ ...rest, variant: "h1", pb: "0.3em", fontSize: "2em", fontWeight: 700 }, id)
    ),
    h2: ({ id, ...rest }) => (
      // @ts-ignore
      headerWithAnchor({ ...rest, variant: "h2", pb: "0.3em", mt: "1em", fontSize: "1.5em", fontWeight: 700 }, id)
    ),
    h3: ({ id, ...rest }) => (
      // @ts-ignore
      headerWithAnchor({ ...rest, variant: "h3", mt: "1.2em", fontSize: "1.25em", fontWeight: 700 }, id)
    ),
    h4: ({ id, ...rest }) => (
      // @ts-ignore
      headerWithAnchor({ ...rest, variant: "h4", mt: "1.2em", fontSize: "1em", fontWeight: 700 }, id)
    ),
    p: (props) => (
      // @ts-ignore
      <Typography variant="body1" component={"p"} fontSize="0.875em" {...props}>
        {props.children}
      </Typography>
    ),
    a: (props) => (
      // @ts-ignore
      <Typography
        component="a"
        href={props.href}
        sx={{
          color: "primary.main",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
        {...props}
      >
        {props.children}
      </Typography>
    ),
    ul: (props) => (
      // @ts-ignore
      <Box component="ul" mb="1em" sx={{ paddingLeft: "2em" }} {...props}>
        {props.children}
      </Box>
    ),
    ol: (props) => (
      // @ts-ignore
      <Box component="ol" sx={{ paddingLeft: 2 }} {...props}>
        {props.children}
      </Box>
    ),
    li: (props) => (
      // @ts-ignore
      <Typography component="li" variant="body1" {...props}>
        {props.children}
      </Typography>
    ),
    ...components,
  };
}
