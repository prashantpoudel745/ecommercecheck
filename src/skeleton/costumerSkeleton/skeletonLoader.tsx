export const SkeletonLoader = () => (
  <div className="space-y-4 sm:space-y-3 lg:space-y-3">
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>

    {/* Charts and Tables Skeleton */}
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm h-80 flex items-center justify-center">
         <div className="h-48 w-48 bg-slate-100 rounded-full animate-pulse"></div>
      </div>
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm h-80 flex flex-col justify-end space-y-4">
         {[...Array(5)].map((_, i) => (
           <div key={i} className="h-6 w-full bg-slate-100 rounded animate-pulse"></div>
         ))}
      </div>
    </div>

    {/* All Clients Table Skeleton */}
    <div className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
         <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
         <div className="flex gap-2">
           <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
           <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
         </div>
      </div>
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
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
           </div>
        ))}
      </div>
    </div>
  </div>
);
