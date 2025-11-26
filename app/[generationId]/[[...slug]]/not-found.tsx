import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The documentation page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="https://docudepthai.com/dashboard"
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
