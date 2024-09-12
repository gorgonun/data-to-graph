import { Typography, Box } from "@mui/material";
import type { MDXComponents } from "mdx/types";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/cjs/languages/hljs/bash";
import "highlight.js/styles/github.css";

SyntaxHighlighter.registerLanguage("bash", bash);

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <Typography variant="h1" gutterBottom pb='0.3em' fontSize='2em' fontWeight={700} sx={{ borderBottom: '1px solid lightGray'}}>
        {props.children}
      </Typography>
    ),
    h2: (props) => (
      <Typography variant="h2" mb='0.75em' pb='0.3em' mt="1em" fontWeight={700} fontSize='1.5em' sx={{ borderBottom: '1px solid lightGray'}}>
        {props.children}
      </Typography>
    ),
    h3: (props) => (
      <Typography variant="h3" mb='0.75em' mt="1.2em" fontWeight={700} fontSize='1.25em'>
        {props.children}
      </Typography>
    ),
    h4: (props) => (
      <Typography variant="h4" mb='0.75em' mt="1.2em" fontWeight={700} fontSize='1em'>
        {props.children}
      </Typography>
    ),
    p: (props) => (
      <Typography variant="body1" component={"p"} fontSize='0.875em'>
        {props.children}
      </Typography>
    ),
    a: (props) => (
      <Typography
        component="a"
        href={props.href}
        sx={{
          color: "primary.main",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {props.children}
      </Typography>
    ),
    ul: (props) => (
      <Box component="ul" mb='1em' sx={{ paddingLeft: '2em' }}>
        {props.children}
      </Box>
    ),
    ol: (props) => (
      <Box component="ol" sx={{ paddingLeft: 2 }}>
        {props.children}
      </Box>
    ),
    li: (props) => (
      <Typography component="li" variant="body1">
        {props.children}
      </Typography>
    ),
    ...components,
  };
}
