import { notFound } from 'next/navigation';
import { getPageContent, getDefaultPageSlug } from '@/lib/source';
import { MDXContent } from '@/components/mdx-content';

interface PageProps {
  params: {
    generationId: string;
    slug?: string[];
  };
}

export default async function Page({ params }: PageProps) {
  const { generationId, slug } = params;

  // If no slug provided, get the default page (index or first page in meta)
  const pageSlug = slug?.join('/') || await getDefaultPageSlug(generationId);

  const page = await getPageContent(generationId, pageSlug);

  if (!page) {
    notFound();
  }

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800">
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-3 !mt-0">{page.title}</h1>
        {page.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400 !mb-0">{page.description}</p>
        )}
      </div>
      <MDXContent content={page.content} />
    </article>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { generationId, slug } = params;
  const pageSlug = slug?.join('/') || await getDefaultPageSlug(generationId);

  const page = await getPageContent(generationId, pageSlug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export async function generateStaticParams() {
  return [];
}

export const revalidate = 60;
