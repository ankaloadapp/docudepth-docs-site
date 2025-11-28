import { ContentSkeleton } from '@/components/skeletons';

export default function PageLoading() {
  return (
    <div className="nx-w-full nx-min-w-0 nx-max-w-6xl nx-px-6 nx-pt-4 md:nx-px-12">
      <ContentSkeleton />
    </div>
  );
}
