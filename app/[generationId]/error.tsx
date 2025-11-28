'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DocsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Docs route error boundary triggered',
      context: {
        error: {
          name: error.name,
          message: error.message,
          digest: error.digest,
        },
      },
    }));
  }, [error]);

  // Determine error type for better messaging
  const isS3Error = error.name === 'S3FetchError' || error.message.includes('S3');
  const isTimeout = error.message.includes('timeout') || error.message.includes('aborted');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {isS3Error
            ? 'Unable to Load Documentation'
            : isTimeout
            ? 'Connection Timeout'
            : 'Error Loading Documentation'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {isS3Error
            ? 'We had trouble connecting to the documentation storage. This is usually temporary.'
            : isTimeout
            ? 'The connection took too long. Please check your internet connection and try again.'
            : 'An error occurred while loading the documentation. Please try again.'}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-left">
            <p className="text-xs font-mono text-amber-700 dark:text-amber-400 break-all">
              {error.name}: {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
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
            Try Again
          </button>
          <Link
            href="https://docudepthai.com/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
