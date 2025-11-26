import { DocsLayout } from 'fumadocs-ui/layout';
import type { ReactNode } from 'react';
import { getDocsStructure } from '@/lib/source';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  params: { generationId: string };
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

  // Build navigation tree from pages
  const tree = buildNavigationTree(structure.meta.pages, generationId, structure.meta.title);

  return (
    <DocsLayout
      tree={tree}
      nav={{
        title: structure.meta.title,
        url: `/${generationId}`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
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
 * Build Fumadocs navigation tree from page slugs
 */
function buildNavigationTree(pages: string[], generationId: string, title: string) {
  const children = pages.map((page) => ({
    type: 'page' as const,
    name: formatPageTitle(page),
    url: `/${generationId}/${page === 'index' ? '' : page}`,
  }));

  return {
    name: title,
    children,
  };
}

/**
 * Format a slug into a readable title
 */
function formatPageTitle(slug: string): string {
  if (slug === 'index') return 'Overview';

  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
