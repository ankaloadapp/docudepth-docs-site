import { notFound } from 'next/navigation';
import { getPageContent, getDocsMetaForGeneration, listPages } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { MDXContent } from '@/components/mdx-content';

interface PageProps {
  params: {
    generationId: string;
    slug?: string[];
  };
}

export default async function Page({ params }: PageProps) {
  const { generationId, slug } = params;
  const pageSlug = slug?.join('/') || 'index';

  const page = await getPageContent(generationId, pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <DocsPage>
      <DocsTitle>{page.title}</DocsTitle>
      {page.description && <DocsDescription>{page.description}</DocsDescription>}
      <DocsBody>
        <MDXContent content={page.content} />
      </DocsBody>
    </DocsPage>
  );
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps) {
  const { generationId, slug } = params;
  const pageSlug = slug?.join('/') || 'index';

  const page = await getPageContent(generationId, pageSlug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

/**
 * Generate static params for known documentation sites
 * This is optional - pages will be generated on-demand if not pre-built
 */
export async function generateStaticParams() {
  // For dynamic S3-based content, we don't pre-generate
  // Pages are rendered on-demand with ISR
  return [];
}

/**
 * Enable ISR with revalidation
 */
export const revalidate = 60; // Revalidate every 60 seconds
