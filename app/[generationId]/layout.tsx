import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { getDocsStructure, getPageContent } from '@/lib/source';
import Link from 'next/link';

// Disable caching - always fetch fresh data from S3
export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: ReactNode;
  params: { generationId: string };
}

// Helper to create slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Extract headings from markdown content
function extractHeadings(content: string): { title: string; slug: string; depth: number }[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: { title: string; slug: string; depth: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const title = match[2].trim();
    headings.push({ title, slug: slugify(title), depth });
  }

  return headings;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { generationId } = params;
  const structure = await getDocsStructure(generationId);

  if (!structure) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Documentation Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This documentation may still be generating or the link is invalid.
        </p>
        <Link
          href="https://docudepthai.com/dashboard"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Get the main content to extract headings for sidebar
  const mainPage = await getPageContent(generationId, 'index');
  const headings = mainPage ? extractHeadings(mainPage.content) : [];

  // Build navigation tree from document headings
  const tree = buildNavigationTreeFromHeadings(headings, generationId, structure.meta.title);

  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: structure.meta.title,
        url: `/${generationId}`,
      }}
      sidebar={{
        defaultOpenLevel: 2,
      }}
      links={[
        {
          text: 'Dashboard',
          url: 'https://docudepthai.com/dashboard',
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}

/**
 * Build Fumadocs navigation tree from document headings
 * Fumadocs PageTree format: { name: string, children: PageTreeItem[] }
 */
function buildNavigationTreeFromHeadings(
  headings: { title: string; slug: string; depth: number }[],
  generationId: string,
  title: string
): { name: string; children: any[] } {
  // Filter to only H2 headings for the main sections
  const h2Headings = headings.filter(h => h.depth === 2);

  const children = h2Headings.map((heading) => ({
    type: 'page' as const,
    name: heading.title,
    url: `/${generationId}#${heading.slug}`,
  }));

  // Fumadocs PageTree expects { name, children } at root
  return {
    name: title,
    children: children.length > 0 ? children : [
      {
        type: 'page' as const,
        name: 'Overview',
        url: `/${generationId}`,
      }
    ],
  };
}
