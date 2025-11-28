'use client';

import { evaluate } from 'nextra/evaluate';
import { useMDXComponents } from '@/mdx-components';
import { useMemo } from 'react';

interface MDXRendererProps {
  compiledSource: string;
}

/**
 * Custom MDX renderer that properly integrates with Nextra's layout
 * We manually invoke the wrapper component with toc/metadata/sourceCode
 * because HOC_MDXWrapper resolves the wrapper at module load time, not runtime
 */
export function MDXRenderer({ compiledSource }: MDXRendererProps) {
  // Use our custom useMDXComponents which includes Mermaid + nextra-theme-docs components
  const components = useMDXComponents();

  // Memoize evaluation to prevent unnecessary re-renders during navigation
  const { MDXContent, toc, metadata, sourceCode } = useMemo(() => {
    try {
      // evaluate returns { default: Component, toc, metadata, sourceCode }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = evaluate(compiledSource, components as any);
      return {
        MDXContent: result.default,
        toc: result.toc || [],
        metadata: result.metadata || {},
        sourceCode: result.sourceCode || '',
      };
    } catch (error) {
      console.error('MDX evaluation error:', error);
      // Return a fallback component on error
      return {
        MDXContent: () => <div>Loading content...</div>,
        toc: [],
        metadata: {},
        sourceCode: '',
      };
    }
  }, [compiledSource, components]);

  // Get the wrapper from components - this is nextra-theme-docs's wrapper
  // that creates the sidebar + content layout
  const Wrapper = components.wrapper;

  if (!Wrapper) {
    // Fallback if no wrapper (shouldn't happen with nextra-theme-docs)
    return <MDXContent />;
  }

  // Manually wrap with the correct props that the wrapper needs
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Wrapper toc={toc} metadata={metadata as any} sourceCode={sourceCode}>
      <MDXContent />
    </Wrapper>
  );
}
