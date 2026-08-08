import React from "react";

export const InsightsSkeleton = () => {
  return (
    <div className="mx-auto max-w-[1520px] space-y-4 sm:space-y-3 lg:space-y-3">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      {/* 4 Metric Tiles Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-4 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* 2 Big Panels Skeleton */}
      <div className="grid gap-4 sm:gap-3 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="h-5 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-80 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="h-[240px] sm:h-[280px] lg:h-[330px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="h-[240px] sm:h-[280px] lg:h-[330px] bg-slate-100 dark:bg-slate-800 rounded-full mx-auto w-[240px] animate-pulse"></div>
        </div>
      </div>

      {/* 3 Small Panels Skeleton */}
      <div className="grid gap-4 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-[220px] sm:h-[260px] lg:h-[280px] flex items-center justify-center">
              <div className="h-32 w-32 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
