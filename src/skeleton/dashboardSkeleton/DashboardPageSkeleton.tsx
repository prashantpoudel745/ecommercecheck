import React from "react";
import { FinancialOverviewSkeleton, InventoryStatusSkeleton, RecentActivitySkeleton } from "./dashboardSkeleton";

export const DashboardPageSkeleton = () => {
  return (
    <div className="mx-auto max-w-[1520px] space-y-4 px-0">
      {/* Header Skeleton */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row items-center justify-between">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse border border-slate-300"></div>
        </div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      {/* Quick Links Skeleton (approximation) */}
      <div className="flex space-x-4 overflow-x-auto py-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-32 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        ))}
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
        <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
           <FinancialOverviewSkeleton />
        </div>
        <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
           <InventoryStatusSkeleton />
        </div>
        <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
           <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  );
};
