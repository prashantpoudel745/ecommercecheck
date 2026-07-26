// AdminHeader.tsx - Header component for admin view
import React from "react";
import { AdminHeaderProps } from "../../../types/attendance.types";


const AdminHeader: React.FC<AdminHeaderProps> = ({ user }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage and monitor employee attendance across your organization
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Company Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.companyName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
