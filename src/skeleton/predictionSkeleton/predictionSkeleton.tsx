import React from "react";

export const PredictionSkeleton = () => {
  return (
    <div className="p-1 sm:p-4 space-y-3">
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50 px-4 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Performance Dashboard Chart Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 gap-1">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-600 rounded-full animate-pulse"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto mb-4"></div>
        <div className="h-56 sm:h-72 lg:h-80 bg-slate-50 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Goals Cards Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Goals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Goals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
