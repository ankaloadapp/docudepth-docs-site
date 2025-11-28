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
  const h2Headings = headings.filter(h => h.depth === 2);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href={`/${generationId}`} className="font-semibold text-lg text-gray-900 dark:text-white">
              {structure.meta.title}
            </Link>
            <Link
              href="https://docudepthai.com/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="sticky top-24 space-y-1">
              <Link
                href={`/${generationId}`}
                className="block px-3 py-2 text-sm font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Overview
              </Link>
              {h2Headings.map((heading) => (
                <Link
                  key={heading.slug}
                  href={`/${generationId}#${heading.slug}`}
                  className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {heading.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
