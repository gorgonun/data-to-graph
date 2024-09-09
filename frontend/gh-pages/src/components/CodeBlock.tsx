import React from 'react';
import { Card, CardContent } from '@mui/material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash';
import { magula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

SyntaxHighlighter.registerLanguage('bash', bash);

interface CodeBlockProps {
  code: string;
}

const CodeBlock = ({ code }: CodeBlockProps) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <SyntaxHighlighter language="bash" style={magula} wrapLongLines>
          {code}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );
};

export default CodeBlock;
