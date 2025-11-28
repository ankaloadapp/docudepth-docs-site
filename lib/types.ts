import type { ReactNode, HTMLAttributes } from 'react';

// ============================================
// S3 Document Types
// ============================================

export interface DocsMeta {
  title: string;
  pages: string[];
  defaultOpen?: boolean;
}

export interface PageContent {
  slug: string;
  title: string;
  description?: string;
  content: string;
}

export interface DocsStructure {
  meta: DocsMeta;
  pages: string[];
}

export interface ParsedFrontmatter {
  title?: string;
  description?: string;
}

export interface ParsedMdx {
  frontmatter: ParsedFrontmatter;
  body: string;
}

// ============================================
// Page Component Types
// ============================================

export interface PageParams {
  generationId: string;
  slug?: string[];
}

export interface PageProps {
  params: Promise<PageParams>;
}

export interface LayoutProps {
  children: ReactNode;
  params: Promise<{ generationId: string }>;
}

// ============================================
// MDX Component Types
// ============================================

export interface CodeComponentProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children?: ReactNode;
  inline?: boolean;
}

export interface PreComponentProps extends HTMLAttributes<HTMLPreElement> {
  children?: ReactNode;
}

// ============================================
// Error Types
// ============================================

export interface SerializedError {
  name: string;
  message: string;
  digest?: string;
}

// ============================================
// PageMap Types (Nextra)
// ============================================

export interface PageMapItem {
  name: string;
  route: string;
  frontMatter?: {
    title?: string;
    description?: string;
  };
}

export interface PageMapMeta {
  data: Record<string, string | { display: string }>;
}

export type PageMap = (PageMapItem | PageMapMeta)[];
