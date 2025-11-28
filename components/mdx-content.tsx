'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Mermaid } from './mermaid';

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  const components = useMemo(
    () => ({
      // Override for code blocks - simple syntax highlighting via CSS classes
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        if (language === 'mermaid') {
          return <Mermaid chart={String(children).trim()} />;
        }

        // Add language class for potential CSS-based highlighting
        const codeClass = language ? `language-${language} ${className || ''}`.trim() : className;
        return <code className={codeClass} {...props}>{children}</code>;
      },
      // Style pre blocks
      pre: ({ children, ...props }: any) => (
        <pre className="overflow-x-auto p-4 rounded-lg bg-gray-100 dark:bg-gray-800" {...props}>
          {children}
        </pre>
      ),
    }),
    []
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
