import { cache } from 'react';
import { fetchWithRetry } from './retry';
import { logWarn, logError } from './logger';
import { S3FetchError, toError } from './errors';
import type { DocsMeta, PageContent, DocsStructure, ParsedMdx } from './types';

// ============================================
// Configuration
// ============================================

const DOCS_PREFIX = 'docs-sites';
const BUCKET = 'docudepth-storage';
const REGION = 'us-east-2';

// ISR revalidation time in seconds (5 minutes)
const REVALIDATE_TIME = 300;

/**
 * Generate public S3 URL for a key
 */
function getS3Url(key: string): string {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Parse YAML frontmatter from MDX content
 */
function parseFrontmatter(content: string): ParsedMdx {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  // Extract title and description from frontmatter
  const titleMatch = frontmatterStr.match(/title:\s*"([^"]+)"/);
  const descMatch = frontmatterStr.match(/description:\s*"([^"]+)"/);

  return {
    frontmatter: {
      title: titleMatch?.[1],
      description: descMatch?.[1],
    },
    body,
  };
}

// ============================================
// Cached Data Fetching Functions
// ============================================

/**
 * Get the meta.json for a generation (cached)
 */
export const getDocsMetaForGeneration = cache(
  async (generationId: string): Promise<DocsMeta | null> => {
    const key = `${DOCS_PREFIX}/${generationId}/meta.json`;
    const url = getS3Url(key);

    try {
      const response = await fetchWithRetry(url, {
        next: {
          revalidate: REVALIDATE_TIME,
          tags: [`docs-${generationId}`],
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          logWarn('Docs meta not found', {
            generationId,
            statusCode: response.status,
          });
          return null;
        }
        throw new S3FetchError(
          `Failed to fetch meta.json: ${response.status}`,
          response.status,
          key,
          generationId
        );
      }

      const body = await response.text();
      if (!body) return null;

      return JSON.parse(body) as DocsMeta;
    } catch (error) {
      const err = toError(error);
      logError('Failed to fetch docs meta', err, {
        generationId,
        operation: 'getDocsMetaForGeneration',
      });

      // Re-throw S3FetchError for error boundary handling
      if (error instanceof S3FetchError) {
        throw error;
      }

      return null;
    }
  }
);

/**
 * Get a specific page content (cached)
 */
export const getPageContent = cache(
  async (generationId: string, slug: string): Promise<PageContent | null> => {
    const pageSlug = slug || 'index';
    const key = `${DOCS_PREFIX}/${generationId}/${pageSlug}.mdx`;
    const url = getS3Url(key);

    try {
      const response = await fetchWithRetry(url, {
        next: {
          revalidate: REVALIDATE_TIME,
          tags: [`docs-${generationId}`, `page-${generationId}-${pageSlug}`],
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          return null;
        }
        throw new S3FetchError(
          `Failed to fetch page: ${response.status}`,
          response.status,
          key,
          generationId
        );
      }

      const content = await response.text();
      if (!content) return null;

      const { frontmatter, body } = parseFrontmatter(content);

      return {
        slug: pageSlug,
        title: frontmatter.title || formatSlugAsTitle(pageSlug),
        description: frontmatter.description,
        content: body,
      };
    } catch (error) {
      const err = toError(error);
      logError('Failed to fetch page content', err, {
        generationId,
        slug: pageSlug,
        operation: 'getPageContent',
      });

      if (error instanceof S3FetchError) {
        throw error;
      }

      return null;
    }
  }
);

/**
 * List all pages for a generation (cached)
 */
export const listPages = cache(async (generationId: string): Promise<string[]> => {
  const prefix = `${DOCS_PREFIX}/${generationId}/`;
  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(prefix)}`;

  try {
    const response = await fetchWithRetry(url, {
      next: {
        revalidate: REVALIDATE_TIME,
        tags: [`docs-${generationId}`],
      },
    });

    if (!response.ok) {
      logWarn('Failed to list pages', {
        generationId,
        statusCode: response.status,
      });
      return [];
    }

    const xml = await response.text();

    // Parse keys from XML response
    const keyRegex = /<Key>([^<]+)<\/Key>/g;
    const pages: string[] = [];
    let match;

    while ((match = keyRegex.exec(xml)) !== null) {
      const key = match[1];
      if (key.endsWith('.mdx')) {
        const parts = key.split('/');
        const filename = parts[parts.length - 1];
        pages.push(filename.replace('.mdx', ''));
      }
    }

    return pages;
  } catch (error) {
    const err = toError(error);
    logError('Failed to list pages', err, {
      generationId,
      operation: 'listPages',
    });
    return [];
  }
});

/**
 * Get full docs structure for a generation (cached)
 */
export const getDocsStructure = cache(
  async (generationId: string): Promise<DocsStructure | null> => {
    const [meta, pages] = await Promise.all([
      getDocsMetaForGeneration(generationId),
      listPages(generationId),
    ]);

    if (!meta) return null;

    return {
      meta,
      pages,
    };
  }
);

/**
 * Get the default page slug for a generation
 */
export const getDefaultPageSlug = cache(async (generationId: string): Promise<string> => {
  // Check if index.mdx exists
  const indexPage = await getPageContent(generationId, 'index');
  if (indexPage) {
    return 'index';
  }

  // Fall back to first page in meta.pages
  const meta = await getDocsMetaForGeneration(generationId);
  if (meta?.pages?.length) {
    return meta.pages[0];
  }

  return 'index'; // Final fallback
});

/**
 * Check if documentation exists for a generation
 */
export const docsExist = cache(async (generationId: string): Promise<boolean> => {
  const meta = await getDocsMetaForGeneration(generationId);
  return meta !== null;
});

// ============================================
// Utility Functions
// ============================================

/**
 * Format a slug as a title (e.g., "getting-started" -> "Getting Started")
 */
export function formatSlugAsTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Re-export types for convenience
 */
export type { DocsMeta, PageContent, DocsStructure };
