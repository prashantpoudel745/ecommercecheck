import React from "react";

export const EmployeeSkeleton = () => {
  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow mb-4 w-full">
        {/* Header / Search */}
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 w-32 bg-slate-200 rounded-md animate-pulse"></div>
              <div className="h-10 w-32 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 w-full bg-slate-100 rounded-md animate-pulse"></div>
        </div>

        {/* Table Body */}
        <div className="p-4 space-y-4">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
                 <div className="space-y-2">
                   <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                   <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                 </div>
               </div>
               <div className="hidden sm:block h-6 w-20 bg-slate-200 rounded-full animate-pulse"></div>
               <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
               <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
