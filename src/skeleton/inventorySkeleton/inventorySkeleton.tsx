import React from "react";

export const InventorySkeleton = () => {
  return (
    <div className="space-y-3">
      {/* Email Notification Skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-40 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-72 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2 mt-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <div className="h-9 w-64 bg-slate-200 rounded animate-pulse"></div>
           <div className="flex gap-2">
             <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
             <div className="h-9 w-24 bg-slate-200 rounded animate-pulse"></div>
           </div>
        </div>
        <div className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="p-4 text-left"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="p-4">
                       <div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
