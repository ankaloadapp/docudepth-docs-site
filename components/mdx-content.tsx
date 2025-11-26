'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Mermaid } from './mermaid';

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  const components = useMemo(
    () => ({
      // Custom code block handler for Mermaid diagrams
      code: ({ className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';

        // Handle Mermaid diagrams
        if (language === 'mermaid') {
          return <Mermaid chart={String(children).trim()} />;
        }

        // Inline code
        if (!className) {
          return (
            <code
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
              {...props}
            >
              {children}
            </code>
          );
        }

        // Code blocks with syntax highlighting
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      // Custom pre wrapper for code blocks
      pre: ({ children, ...props }: any) => (
        <pre
          className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto my-4"
          {...props}
        >
          {children}
        </pre>
      ),
      // Custom heading styles
      h1: ({ children, ...props }: any) => (
        <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>
          {children}
        </h1>
      ),
      h2: ({ children, ...props }: any) => (
        <h2 className="text-2xl font-semibold mt-6 mb-3 border-b pb-2" {...props}>
          {children}
        </h2>
      ),
      h3: ({ children, ...props }: any) => (
        <h3 className="text-xl font-semibold mt-4 mb-2" {...props}>
          {children}
        </h3>
      ),
      h4: ({ children, ...props }: any) => (
        <h4 className="text-lg font-medium mt-3 mb-2" {...props}>
          {children}
        </h4>
      ),
      // Paragraphs
      p: ({ children, ...props }: any) => (
        <p className="my-3 leading-7" {...props}>
          {children}
        </p>
      ),
      // Links
      a: ({ href, children, ...props }: any) => (
        <a
          href={href}
          className="text-purple-600 dark:text-purple-400 hover:underline"
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      ),
      // Lists
      ul: ({ children, ...props }: any) => (
        <ul className="list-disc list-inside my-3 space-y-1" {...props}>
          {children}
        </ul>
      ),
      ol: ({ children, ...props }: any) => (
        <ol className="list-decimal list-inside my-3 space-y-1" {...props}>
          {children}
        </ol>
      ),
      li: ({ children, ...props }: any) => (
        <li className="leading-7" {...props}>
          {children}
        </li>
      ),
      // Blockquotes
      blockquote: ({ children, ...props }: any) => (
        <blockquote
          className="border-l-4 border-purple-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
          {...props}
        >
          {children}
        </blockquote>
      ),
      // Tables
      table: ({ children, ...props }: any) => (
        <div className="overflow-x-auto my-4">
          <table
            className="min-w-full border-collapse border border-gray-200 dark:border-gray-700"
            {...props}
          >
            {children}
          </table>
        </div>
      ),
      th: ({ children, ...props }: any) => (
        <th
          className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left"
          {...props}
        >
          {children}
        </th>
      ),
      td: ({ children, ...props }: any) => (
        <td
          className="border border-gray-200 dark:border-gray-700 px-4 py-2"
          {...props}
        >
          {children}
        </td>
      ),
      // Horizontal rule
      hr: (props: any) => (
        <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
      ),
      // Images
      img: ({ src, alt, ...props }: any) => (
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full h-auto rounded-lg my-4"
          loading="lazy"
          {...props}
        />
      ),
    }),
    []
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
