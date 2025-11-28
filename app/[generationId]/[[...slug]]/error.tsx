'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ error, reset }: ErrorProps) {
  const params = useParams();
  const generationId = params?.generationId as string;

  useEffect(() => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Page error boundary triggered',
      context: {
        generationId,
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
      },
    }));
  }, [error, generationId]);

  // Determine error type
  const isMDXError = error.name === 'MDXCompilationError' || error.message.includes('MDX');
  const isS3Error = error.name === 'S3FetchError' || error.message.includes('S3');

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-12 w-12 text-orange-500"
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

        <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
          {isMDXError
            ? 'Page Rendering Error'
            : isS3Error
            ? 'Unable to Load Page'
            : 'Error Loading Page'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          {isMDXError
            ? 'There was a problem rendering this page. The documentation may contain invalid content.'
            : isS3Error
            ? 'This page could not be loaded. It may have been moved or is temporarily unavailable.'
            : 'An error occurred while loading this page. Please try again.'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-left">
            <p className="text-xs font-mono text-orange-700 dark:text-orange-400 break-all">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
          {generationId && (
            <Link
              href={`/${generationId}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Back to Index
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
