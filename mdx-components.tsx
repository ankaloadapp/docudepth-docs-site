import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Lazy load Mermaid component to reduce initial bundle size
const Mermaid = dynamic(
  () => import('@/components/mermaid').then((mod) => mod.Mermaid),
  {
    ssr: false,
    loading: () => (
      <div className="my-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading diagram...</span>
        </div>
      </div>
    ),
  }
);

/**
 * Check if a React element is a code block with mermaid language
 */
function isMermaidCodeBlock(child: ReactNode): boolean {
  if (!child || typeof child !== 'object') return false;

  const element = child as ReactElement<{
    className?: string;
    children?: ReactNode;
    'data-language'?: string;
  }>;

  if (!element.props) return false;

  const className = element.props.className || '';
  const dataLanguage = element.props['data-language'] || '';

  return (
    className.includes('language-mermaid') ||
    className.includes('mermaid') ||
    dataLanguage === 'mermaid'
  );
}

/**
 * Extract mermaid code from a code element
 */
function getMermaidCode(child: ReactNode): string | null {
  if (!child || typeof child !== 'object') return null;

  const element = child as ReactElement<{ children?: ReactNode }>;
  const children = element.props?.children;

  if (typeof children === 'string') {
    return children.trim();
  }

  return null;
}

/**
 * Custom pre component that renders Mermaid diagrams
 */
function CustomPre({
  children,
  ...props
}: ComponentPropsWithoutRef<'pre'>): ReactElement {
  // Check if this is a mermaid code block
  if (isMermaidCodeBlock(children)) {
    const mermaidCode = getMermaidCode(children);
    if (mermaidCode) {
      return <Mermaid chart={mermaidCode} />;
    }
  }

  // Default pre rendering
  return <pre {...props}>{children}</pre>;
}

// Get default Nextra docs components
const docsComponents = getDocsMDXComponents();

/**
 * MDX components registry
 * Extends Nextra docs components with custom Mermaid support
 */
export function useMDXComponents(components?: Record<string, React.ComponentType>) {
  return {
    ...docsComponents,
    // Override pre to handle Mermaid diagrams
    pre: CustomPre,
    // Make Mermaid available as a direct component in MDX
    Mermaid,
    // Allow additional component overrides
    ...components,
  };
}
