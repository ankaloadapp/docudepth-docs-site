/**
 * Custom error classes for DocuDepth docs-site
 */

/**
 * Error thrown when S3 fetch fails
 */
export class S3FetchError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly key: string,
    public readonly generationId: string
  ) {
    super(message);
    this.name = 'S3FetchError';

    // Maintain proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, S3FetchError);
    }
  }
}

/**
 * Error thrown when MDX compilation fails
 */
export class MDXCompilationError extends Error {
  constructor(
    message: string,
    public readonly slug: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'MDXCompilationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MDXCompilationError);
    }
  }
}

/**
 * Error thrown when documentation is not found
 */
export class DocsNotFoundError extends Error {
  constructor(public readonly generationId: string) {
    super(`Documentation not found for generation: ${generationId}`);
    this.name = 'DocsNotFoundError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DocsNotFoundError);
    }
  }
}

/**
 * Error thrown when a page is not found within a documentation set
 */
export class PageNotFoundError extends Error {
  constructor(
    public readonly generationId: string,
    public readonly slug: string
  ) {
    super(`Page "${slug}" not found in documentation: ${generationId}`);
    this.name = 'PageNotFoundError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PageNotFoundError);
    }
  }
}

/**
 * Type guard to check if an error is an S3FetchError
 */
export function isS3FetchError(error: unknown): error is S3FetchError {
  return error instanceof S3FetchError;
}

/**
 * Type guard to check if an error is an MDXCompilationError
 */
export function isMDXCompilationError(error: unknown): error is MDXCompilationError {
  return error instanceof MDXCompilationError;
}

/**
 * Type guard to check if an error is a DocsNotFoundError
 */
export function isDocsNotFoundError(error: unknown): error is DocsNotFoundError {
  return error instanceof DocsNotFoundError;
}

/**
 * Convert unknown error to Error instance
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}
