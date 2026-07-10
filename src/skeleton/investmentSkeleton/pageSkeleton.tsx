import { ChartSkeleton } from "./chartSkeleton";
import { StatsCardsSkeleton } from "./statsCardsSkeleton";
import { TableSkeleton } from "./tableSkeleton";

export const PageSkeleton = () => (
  <div className="space-y-6">
    <StatsCardsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    <div className="w-full">
      <TableSkeleton />
    </div>
  </div>
);
