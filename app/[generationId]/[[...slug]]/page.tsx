import { notFound } from 'next/navigation';
import { compileMdx } from 'nextra/compile';
import { evaluate } from 'nextra/evaluate';
import { MDXRemote } from 'nextra/mdx-remote';
import { useMDXComponents } from '@/mdx-components';
import { getPageContent, getDefaultPageSlug } from '@/lib/source';

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

  // Compile MDX content using Nextra
  const rawJs = await compileMdx(page.content, {
    filePath: `${pageSlug}.mdx`,
    useCachedCompiler: true,
  });

  // Evaluate the compiled MDX
  const { default: MDXContent, toc, metadata } = evaluate(rawJs, useMDXComponents());

  return (
    <main className="nx-w-full nx-min-w-0 nx-max-w-6xl nx-px-6 nx-pt-4 md:nx-px-12">
      <article className="nx-w-full nx-break-words">
        {/* Title from frontmatter or page data */}
        <h1 className="nx-mt-2 nx-text-4xl nx-font-bold nx-tracking-tight nx-text-slate-900 dark:nx-text-slate-100">
          {page.title}
        </h1>
        {page.description && (
          <p className="nx-mt-4 nx-text-lg nx-text-gray-600 dark:nx-text-gray-400">
            {page.description}
          </p>
        )}
        <div className="nx-mt-8">
          <MDXContent />
        </div>
      </article>
    </main>
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
