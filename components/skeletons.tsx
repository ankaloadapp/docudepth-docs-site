/**
 * Reusable skeleton components for loading states
 */

interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className = '' }: TextSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${100 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}

export function TitleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}

export function CodeBlockSkeleton() {
  return (
    <div className="animate-pulse my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: `${70 + (i % 3) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6" />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${80 - (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

export function TOCSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
          style={{
            width: `${60 + (i % 2) * 20}%`,
            marginLeft: i > 2 ? '1rem' : 0,
          }}
        />
      ))}
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <TitleSkeleton />
      <TextSkeleton lines={4} />
      <CodeBlockSkeleton />
      <TextSkeleton lines={3} />
      <TextSkeleton lines={5} />
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <aside className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800 p-4">
        <SidebarSkeleton />
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-8 max-w-4xl">
        <ContentSkeleton />
      </main>

      {/* TOC skeleton */}
      <aside className="hidden xl:block w-48 p-4">
        <TOCSkeleton />
      </aside>
    </div>
  );
}
