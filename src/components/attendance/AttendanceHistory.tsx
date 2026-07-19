import React, { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import { AttendanceRecord } from "../../../types";
import {
  formatDate,
  formatDuration,
  formatTime,
  getStatusColor,
} from "@/utils/utils";
import api, { getAttendance } from "@/utils/api";
interface AttendanceHistoryProps {
  employeeId: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  employeeId,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const response = await getAttendance(employeeId, {
          page,
          limit: 10,
        });
        setRecords(response.data);
        setTotalPages(response.pagination.pages);
      } catch (error) {
        // console.error("Failed to load attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [employeeId, page]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Attendance History
        </h2>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Check In
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Check Out
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.checkOut ? formatTime(record.checkOut) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDuration(record.checkIn, record.checkOut)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;
