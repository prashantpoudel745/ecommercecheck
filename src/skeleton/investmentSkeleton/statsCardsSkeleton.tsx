import { StatCardSkeleton } from "./statCardSkeleton";

export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);
