const DOCS_PREFIX = 'docs-sites';
const BUCKET = 'docudepth-storage';
const REGION = 'us-east-2';

// Use public S3 URL for fetching (bucket has public read policy for docs-sites/*)
function getS3Url(key: string): string {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

export interface DocsMeta {
  title: string;
  pages: string[];
  defaultOpen?: boolean;
}

export interface PageContent {
  slug: string;
  title: string;
  description?: string;
  content: string;
}

export interface DocsStructure {
  meta: DocsMeta;
  pages: string[];
}

/**
 * Get the meta.json for a generation
 */
export async function getDocsMetaForGeneration(generationId: string): Promise<DocsMeta | null> {
  try {
    const url = getS3Url(`${DOCS_PREFIX}/${generationId}/meta.json`);
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return null;
      }
      throw new Error(`Failed to fetch meta.json: ${response.status}`);
    }

    const body = await response.text();
    if (!body) return null;

    return JSON.parse(body) as DocsMeta;
  } catch (error: any) {
    console.error('Error fetching docs meta:', error);
    return null;
  }
}

/**
 * Get a specific page content
 */
export async function getPageContent(
  generationId: string,
  slug: string
): Promise<PageContent | null> {
  try {
    // Default to index if no slug
    const pageSlug = slug || 'index';
    const key = `${DOCS_PREFIX}/${generationId}/${pageSlug}.mdx`;
    const url = getS3Url(key);

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return null;
      }
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const content = await response.text();
    if (!content) return null;

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      return {
        slug: pageSlug,
        title: pageSlug,
        content: content,
      };
    }

    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];

    // Extract title and description from frontmatter
    const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
    const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);

    return {
      slug: pageSlug,
      title: titleMatch ? titleMatch[1] : pageSlug,
      description: descMatch ? descMatch[1] : undefined,
      content: body.trim(),
    };
  } catch (error: any) {
    console.error('Error fetching page content:', error);
    return null;
  }
}

/**
 * List all pages for a generation
 * Uses the S3 ListBucketResult API for public buckets
 */
export async function listPages(generationId: string): Promise<string[]> {
  try {
    const prefix = `${DOCS_PREFIX}/${generationId}/`;
    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(prefix)}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to list pages:', response.status);
      return [];
    }

    const xml = await response.text();

    // Parse keys from XML response
    const keyMatches = xml.matchAll(/<Key>([^<]+)<\/Key>/g);
    const pages: string[] = [];

    for (const match of keyMatches) {
      const key = match[1];
      if (key.endsWith('.mdx')) {
        const parts = key.split('/');
        const filename = parts[parts.length - 1];
        pages.push(filename.replace('.mdx', ''));
      }
    }

    return pages;
  } catch (error) {
    console.error('Error listing pages:', error);
    return [];
  }
}

/**
 * Get full docs structure for a generation
 */
export async function getDocsStructure(generationId: string): Promise<DocsStructure | null> {
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

/**
 * Check if documentation exists for a generation
 */
export async function docsExist(generationId: string): Promise<boolean> {
  const meta = await getDocsMetaForGeneration(generationId);
  return meta !== null;
}
