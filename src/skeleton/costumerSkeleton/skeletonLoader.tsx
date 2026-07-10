export const SkeletonLoader = () => (
  <div className="p-6 space-y-6">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
  </div>
);
