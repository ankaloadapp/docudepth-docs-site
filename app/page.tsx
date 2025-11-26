import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          DocuDepth Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          AI-powered documentation for your codebase
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="https://docudepthai.com/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="https://docudepthai.com"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
}
