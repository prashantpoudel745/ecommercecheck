export const SkeletonLoader = () => (
  <div className="p-4 space-y-3">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
  </div>
);
