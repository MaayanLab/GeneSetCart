import { Typography, Grid } from "@mui/material";
import Container from "@mui/material/Container";
import Header from '@/components/header/Header';
import { readFileSync } from "fs"
import path from 'path'
import Markdown from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styles from './documentation.module.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default async function DocumentationPage({ params }: { params: { id: string } }) {
    const documentationText = readFileSync(
        path.resolve('app/api-documentation', './documentation.md'),
        { encoding: 'utf8', flag: 'r' }
    )

    return (
        <>
            <Grid item>
                <Header sessionId={params.id} />
            </Grid>
            <Container>
                <Typography variant="h3" color="secondary.dark" sx={{ mb: 2, mt: 2 }}>API DOCUMENTATION</Typography>
                <Typography variant="subtitle1" color="#666666" sx={{ mb: 3 }}>
                </Typography>
                 <ReactMarkdown
                  className={styles.markdown}
                   rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                
                          return !inline && match ? (
                            <SyntaxHighlighter style={dracula} PreTag="div" language={match[1]} {...props}>
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                 >{documentationText}</ReactMarkdown>
            </Container>
        </>
    )
}