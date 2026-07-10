import React from "react";

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite linear;
    background: linear-gradient(to right, #e5e7eb 8%, #d1d5db 18%, #e5e7eb 33%);
    background-size: 800px 104px;
  }
  .dark .animate-shimmer {
    background: linear-gradient(to right, #374151 8%, #4b5563 18%, #374151 33%);
    background-size: 800px 104px;
  }
`;

export const FinancialOverviewSkeleton = () => (
  <>
    <style>{shimmer}</style>
    <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-1 w-full">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-64 animate-shimmer"></div>
    </div>
  </>
);

export const InventoryStatusSkeleton = () => (
  <>
    <style>{shimmer}</style>
    <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-1 w-full">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-64 animate-shimmer"></div>
    </div>
  </>
);

export const RecentActivitySkeleton = () => (
  <>
    <style>{shimmer}</style>
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 h-48">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 mb-2 animate-shimmer rounded"></div>
        ))}
      </div>
    </div>
  </>
);
