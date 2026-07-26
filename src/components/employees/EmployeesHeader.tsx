import React from "react";
import { Employee } from "../../../types/employee.types";

interface HeaderProps {
  employee: Employee | null;
}

const Header: React.FC<HeaderProps> = ({ employee }) => (
  <div className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
      {/* {employee && (
        <div className="mt-2 text-sm text-gray-600">
          <p>{employee.name}</p>
          <p>
            {employee.department} - {employee.position}
          </p>
        </div>
      )} */}
    </div>
  </div>
);

export default Header;
