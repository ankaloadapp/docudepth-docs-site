import { notFound } from 'next/navigation';
import { compileMdx } from 'nextra/compile';
import { MDXRenderer } from '@/components/mdx-renderer';
import { getPageContent, getDefaultPageSlug } from '@/lib/source';
import type { PageProps } from '@/lib/types';

export default async function Page({ params }: PageProps) {
  const { generationId, slug } = await params;

  // If no slug provided, get the default page (index or first page in meta)
  const pageSlug = slug?.join('/') || await getDefaultPageSlug(generationId);

  const page = await getPageContent(generationId, pageSlug);

  if (!page) {
    notFound();
  }

  // Reconstruct full MDX with frontmatter for proper metadata handling
  const fullMdxContent = `---
title: "${page.title.replace(/"/g, '\\"')}"
${page.description ? `description: "${page.description.replace(/"/g, '\\"')}"` : ''}
---

${page.content}`;

  // Compile MDX content using Nextra
  const compiledSource = await compileMdx(fullMdxContent, {
    filePath: `${pageSlug}.mdx`,
    useCachedCompiler: true,
  });

  // Use custom MDXRenderer that properly passes toc/metadata to wrapper
  // This enables the desktop sidebar layout
  return <MDXRenderer compiledSource={compiledSource} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { generationId, slug } = await params;
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
  // Return empty array - all pages are generated on-demand
  return [];
}

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Allow any generationId to be accessed
export const dynamicParams = true;
