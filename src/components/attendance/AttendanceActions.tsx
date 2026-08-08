import api, { checkIn, checkOut } from "@/utils/api";
import React, { useState } from "react";
import { CurrentStatus } from "../../../types/attendance.types";
interface AttendanceActionsProps {
  employeeId: string;
  status: CurrentStatus;
  onStatusChange: () => void;
}

const AttendanceActions: React.FC<AttendanceActionsProps> = ({
  employeeId,
  status,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkIn(employeeId, { location: "office" });
      onStatusChange();
    } catch (err) {
      setError(err.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await checkOut(employeeId, {});
      onStatusChange();
    } catch (err) {
      setError(err.message || "Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.isCheckedIn
              ? status.isCheckedOut
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status.isCheckedIn
            ? status.isCheckedOut
              ? "Checked Out"
              : "Checked In"
            : "Not Checked In"}
        </span>
      </div>
      {error && (
        <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleCheckIn}
          disabled={loading || status.isCheckedIn || !status.canCheckIn}
          className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 hover:text-slate-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Check In"}
        </button>
        <button
          onClick={handleCheckOut}
          disabled={loading || !status.canCheckOut}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Check Out"}
        </button>
      </div>
    </div>
  );
};

export default AttendanceActions;
