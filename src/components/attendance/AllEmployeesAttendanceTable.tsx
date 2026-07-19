import React, { useState, useMemo } from "react";
import { AttendanceRecord, Props } from "../../../types";

const AllEmployeesAttendanceTable: React.FC<Props> = ({
  data,
  loading,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onRefresh,
  groupBy,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ✅ Memoize flattened data
  const flattened: AttendanceRecord[] = useMemo(() => {
    let result: AttendanceRecord[] = [];
    try {
      if (!data || typeof data !== "object") {
        return [];
      }

      if (Array.isArray(data)) {
        result = data.map((record: any, index: number) => ({
          _id: record._id || `generated-id-${index}`,
          employee: record.employee || null,
          user: record.user || null,
          checkIn: record.checkIn || null,
          date: record.checkIn?.split("T")[0] || record.date || "-",
          status: record.status || "-",
          employeeName:
            record.user?.fullName ||
            record.user?.name ||
            record.employeeName ||
            record.name ||
            "N/A",
          employeeEmail: record.user?.email || record.email || "N/A",
          hoursWorked:
            record.workingHours?.actual ||
            record.workSummary?.hoursWorked ||
            record.totalWorkHours ||
            record.hoursWorked ||
            0,
          department:
            record.employee?.department ||
            record.department ||
            record.user?.department ||
            "-",
        }));
      } else if (typeof data === "object") {
        Object.entries(data).forEach(([employeeId, group]: [string, any]) => {
          const employee = group.employee || {};
          const records = group.records || [];
          if (Array.isArray(records)) {
            records.forEach((record: any, recordIndex: number) => {
              result.push({
                _id: record._id || `generated-id-${employeeId}-${recordIndex}`,
                employee,
                user: employee,
                checkIn:
                  record.checkIn || record.createdAt || record.date || null,
                date: record.createdAt?.split("T")[0] || record.date || "-",
                status: record.status || "-",
                employeeName: employee?.fullName || employee?.name || "N/A",
                employeeEmail: employee?.email || "N/A",
                hoursWorked:
                  record.workingHours?.actual ||
                  record.workSummary?.hoursWorked ||
                  record.totalWorkHours ||
                  record.hoursWorked ||
                  0,
                department:
                  employee?.department ||
                  record.employee?.department ||
                  record.department ||
                  record.user?.department ||
                  "-",
              });
            });
          }
        });
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
    return result;
  }, [data]);

  // ✅ Memoize filtered data for current view
  const filteredData = useMemo(() => {
    if (showHistory && selectedEmployee) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const oneMonthAgoStr = oneMonthAgo.toISOString().split("T")[0];

      return flattened
        .filter(
          (record) =>
            record.employeeEmail === selectedEmployee &&
            record.date >= oneMonthAgoStr
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }
    return flattened.filter((record) => record.date === today);
  }, [flattened, showHistory, selectedEmployee, today]);

  // ✅ Memoize unique employees
  const uniqueEmployees = useMemo(() => {
    const employees = new Map();
    flattened
      .filter((record) => record.date === today)
      .forEach((record) => {
        if (!employees.has(record.employeeEmail)) {
          employees.set(record.employeeEmail, {
            name: record.employeeName,
            email: record.employeeEmail,
            department: record.department,
          });
        }
      });
    return Array.from(employees.values());
  }, [flattened, today]);

  const handleViewHistory = (employeeEmail: string) => {
    setSelectedEmployee(employeeEmail);
    setShowHistory(true);
  };

  const handleBackToToday = () => {
    setShowHistory(false);
    setSelectedEmployee(null);
  };

  // 🟡 Show debug info if no data
  if (!loading && flattened.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No Records Found
          </h3>
          <p className="text-yellow-700 mb-3">
            No attendance data available. Check the data source and try again.
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {showHistory
            ? `Attendance History - ${
                uniqueEmployees.find((e) => e.email === selectedEmployee)
                  ?.name || "Employee"
              }`
            : `Today's Attendance (${filteredData.length} records)`}
        </h2>
        <div className="flex space-x-2">
          {showHistory && (
            <button
              onClick={handleBackToToday}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Today
            </button>
          )}
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Employees */}
      {!showHistory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uniqueEmployees.map((emp) => (
            <div
              key={emp.email}
              className="p-3 bg-white border rounded flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.department}</div>
              </div>
              <button
                onClick={() => handleViewHistory(emp.email)}
                className="px-2 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200"
              >
                View History
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Employee Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Hours Worked</th>
              <th className="p-3 border-b">Department</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record, i) => (
              <tr
                key={`${record.employeeEmail}-${record.date}-${i}`}
                className="border-t text-sm hover:bg-gray-50"
              >
                <td className="p-3">{record.date}</td>
                <td className="p-3">{record.employeeName}</td>
                <td className="p-3 text-gray-600">{record.employeeEmail}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.status.toLowerCase() === "present"
                        ? "bg-green-100 text-green-800"
                        : record.status.toLowerCase() === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="p-3">{record.hoursWorked}</td>
                <td className="p-3">{record.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllEmployeesAttendanceTable;
