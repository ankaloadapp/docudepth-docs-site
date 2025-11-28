import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const DOCS_PREFIX = 'docs-sites';

// Lazy-load S3 client to get runtime env vars (not build-time)
let _s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (!_s3Client) {
    // Use DOCUDEPTH_ prefix for Amplify (AWS_ prefix is reserved)
    const region = process.env.DOCUDEPTH_REGION || process.env.AWS_REGION || 'us-east-2';
    const accessKeyId = process.env.DOCUDEPTH_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.DOCUDEPTH_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

    console.log('[S3Client] Initializing with region:', region, 'hasCredentials:', !!accessKeyId);

    // Use explicit credentials if provided, otherwise use anonymous access for public bucket
    const credentials = accessKeyId
      ? { accessKeyId, secretAccessKey: secretAccessKey! }
      : { accessKeyId: '', secretAccessKey: '', sessionToken: '' };

    _s3Client = new S3Client({
      region,
      credentials,
      // Disable credential provider chain to avoid errors
      ...(accessKeyId ? {} : { signer: { sign: async (request: any) => request } }),
    });
  }
  return _s3Client;
}

function getBucket(): string {
  return process.env.S3_DOCS_BUCKET || 'docudepth-storage';
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
    const response = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: `${DOCS_PREFIX}/${generationId}/meta.json`,
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) return null;

    return JSON.parse(body) as DocsMeta;
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
      return null;
    }
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

    const response = await getS3Client().send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );

    const content = await response.Body?.transformToString();
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
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
      return null;
    }
    console.error('Error fetching page content:', error);
    return null;
  }
}

/**
 * List all pages for a generation
 */
export async function listPages(generationId: string): Promise<string[]> {
  try {
    const response = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        Prefix: `${DOCS_PREFIX}/${generationId}/`,
      })
    );

    if (!response.Contents) return [];

    return response.Contents
      .map((obj) => obj.Key || '')
      .filter((key) => key.endsWith('.mdx'))
      .map((key) => {
        // Extract slug from key: docs-sites/{id}/{slug}.mdx -> slug
        const parts = key.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.mdx', '');
      });
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
