'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { Mermaid } from './mermaid';

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  const components = useMemo(
    () => ({
      // Only override for Mermaid detection
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (language === 'mermaid') {
          return <Mermaid chart={String(children).trim()} />;
        }

        return <code className={className} {...props}>{children}</code>;
      },
    }),
    []
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight, rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
