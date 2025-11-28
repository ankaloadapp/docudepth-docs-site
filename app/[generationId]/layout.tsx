import type { ReactNode } from 'react';
import { Layout, Navbar } from 'nextra-theme-docs';
import { getDocsStructure, getPageContent } from '@/lib/source';
import Link from 'next/link';

// Disable caching - always fetch fresh data from S3
export const dynamic = 'force-dynamic';

interface LayoutProps {
  children: ReactNode;
  params: { generationId: string };
}

// Build page map from our S3 docs structure
async function buildPageMap(generationId: string, structure: { meta: { title: string; pages: string[] } }) {
  // Build flat page items for Nextra
  const pageItems = await Promise.all(
    structure.meta.pages.map(async (pageSlug) => {
      const pageContent = await getPageContent(generationId, pageSlug);
      const title = pageContent?.title || pageSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        name: pageSlug,
        route: `/${generationId}/${pageSlug}`,
        frontMatter: { title },
      };
    })
  );

  // Return as array with data entry for metadata
  return [
    {
      data: {
        '*': { display: 'hidden' },
        ...Object.fromEntries(
          structure.meta.pages.map((slug) => {
            const item = pageItems.find(p => p.name === slug);
            return [slug, item?.frontMatter.title || slug];
          })
        ),
      },
    },
    ...pageItems,
  ];
}

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { generationId } = params;
  const structure = await getDocsStructure(generationId);

  if (!structure) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Documentation Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This documentation may still be generating or the link is invalid.
          </p>
          <Link
            href="https://docudepthai.com/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pageMap = await buildPageMap(generationId, structure);

  return (
    <Layout
      navbar={
        <Navbar
          logo={
            <span className="font-bold text-lg">{structure.meta.title}</span>
          }
          projectLink="https://docudepthai.com/dashboard"
        />
      }
      sidebar={{
        defaultMenuCollapseLevel: 1,
        autoCollapse: false,
      }}
      pageMap={pageMap}
      docsRepositoryBase="https://docudepthai.com"
      footer={
        <div className="flex w-full flex-col items-center sm:items-start">
          <p className="text-sm text-gray-500">
            Generated with DocuDepth AI
          </p>
        </div>
      }
    >
      {children}
    </Layout>
  );
}
