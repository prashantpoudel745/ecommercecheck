export const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow animate-pulse">
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);
