// AttendanceFilters.tsx - Filters component for admin attendance view
import React, { useState } from "react";
import type { AttendanceFilters ,AttendanceFiltersProps} from "../../../types/attendance.types";



const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick date range helpers
  const setQuickDateRange = (range: string) => {
    const today = new Date();
    let startDate = new Date();

    switch (range) {
      case "today":
        startDate = new Date();
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        break;
      case "week":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      default:
        return;
    }

    onFilterChange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "employee" && value !== "none"
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          >
            {isExpanded ? "Less Filters" : "More Filters"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Quick Date Range Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Date Ranges
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Today", value: "today" },
              { label: "Yesterday", value: "yesterday" },
              { label: "Last 7 Days", value: "week" },
              { label: "Last Month", value: "month" },
              { label: "Last Quarter", value: "quarter" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setQuickDateRange(range.value)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
              <option value="overtime">Overtime</option>
            </select>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <select
              value={filters.groupBy}
              onChange={(e) =>
                onFilterChange({ groupBy: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="date">Date</option>
              <option value="department">Department</option>
              <option value="none">No Grouping</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => onFilterChange({ department: e.target.value })}
                placeholder="Enter department name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Employee ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={filters.employeeId}
                onChange={(e) => onFilterChange({ employeeId: e.target.value })}
                placeholder="Enter employee ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceFilters;
