import type { ReactNode } from 'react';
import { Layout, Navbar } from 'nextra-theme-docs';
import type { PageMapItem, MdxFile } from 'nextra';
import { getDocsStructure, getPageContent, formatSlugAsTitle } from '@/lib/source';
import Link from 'next/link';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Allow any generationId to be accessed
export const dynamicParams = true;

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ generationId: string }>;
}

// Extended MdxFile type with direct title property for sidebar display
interface PageItem extends MdxFile {
  title: string;
}

/**
 * Build Nextra-compatible page map from S3 docs structure
 * Following Nextra's expected format for the docs theme sidebar
 */
async function buildPageMap(
  generationId: string,
  structure: { meta: { title: string; pages: string[] } }
): Promise<PageMapItem[]> {
  // Build page items with direct title property (required for sidebar display)
  const pageItems: PageItem[] = await Promise.all(
    structure.meta.pages.map(async (pageSlug) => {
      const pageContent = await getPageContent(generationId, pageSlug);
      const title = pageContent?.title || formatSlugAsTitle(pageSlug);

      return {
        name: pageSlug,
        route: `/${generationId}/${pageSlug}`,
        // Title must be a direct property for normalizePages to pick it up
        title,
        frontMatter: {
          title,
          description: pageContent?.description,
        },
      };
    })
  );

  // Return pages directly - title is on each item
  return pageItems as PageMapItem[];
}

export default async function DocsLayout({ children, params }: LayoutProps) {
  const { generationId } = await params;
  const structure = await getDocsStructure(generationId);

  if (!structure) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Documentation Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This documentation may still be generating or the link is invalid.
            Please check back in a few minutes.
          </p>
          <Link
            href="https://docudepthai.com/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
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
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              {structure.meta.title}
            </span>
          }
          projectLink="https://docudepthai.com/dashboard"
        />
      }
      pageMap={pageMap}
      docsRepositoryBase="https://docudepthai.com"
      sidebar={{
        defaultMenuCollapseLevel: 2,
        autoCollapse: false,
        toggleButton: true,
      }}
      toc={{
        float: true,
        title: 'On This Page',
        backToTop: true,
      }}
      footer={
        <div className="flex w-full flex-col items-center sm:items-start py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generated with{' '}
            <a
              href="https://docudepthai.com"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              DocuDepth AI
            </a>
          </p>
        </div>
      }
    >
      {children}
    </Layout>
  );
}
