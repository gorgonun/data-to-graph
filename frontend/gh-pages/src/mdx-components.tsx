import { Typography, Box } from '@mui/material'
import type { MDXComponents } from 'mdx/types'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash';
import "highlight.js/styles/github.css";

SyntaxHighlighter.registerLanguage('bash', bash);
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (_props) => (
      <Typography variant="h3" gutterBottom />
    ),
    h2: (_props) => (
      <Typography variant="h4" gutterBottom />
    ),
    h3: (_props) => (
      <Typography variant="h5" gutterBottom />
    ),
    p: (_props) => (
      <Typography variant="body1" paragraph />
    ),
    a: (props) => (
      <Typography
        component="a"
        href={props.href}
        sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      />
    ),
    ul: (_props) => (
      <Box component="ul" sx={{ paddingLeft: 2 }} />
    ),
    ol: (_props) => (
      <Box component="ol" sx={{ paddingLeft: 2 }} />
    ),
    li: (_props) => (
      <Typography component="li" variant="body1" />
    ),
    ...components,
  }
}
