import React from "react";

export const AttendanceSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header Approx */}
      <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
         <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
         <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-4">
        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="border-b border-gray-200 flex space-x-4">
             <div className="h-8 w-24 bg-gray-200 rounded-t border-b-2 border-gray-300 animate-pulse"></div>
             <div className="h-8 w-40 bg-gray-200 rounded-t border-b-2 border-gray-300 animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton (Dashboard view default) */}
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                   <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                   <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
             ))}
          </div>
          
          {/* Charts/Main Area */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-80 flex items-center justify-center">
               <div className="h-48 w-48 bg-gray-100 rounded-full animate-pulse"></div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-80 flex flex-col justify-end space-y-4">
               {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-full bg-gray-100 rounded animate-pulse"></div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
