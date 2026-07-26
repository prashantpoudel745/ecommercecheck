import { User } from ".";
import { Employee } from "./employee.types";
import { DashboardData } from ".";
export interface AdminHeaderProps {
  user: AttendUser;
}
export interface AttendanceFiltersProps {
  filters: AttendanceFilters;
  onFilterChange: (filters: Partial<AttendanceFilters>) => void;
  onClearFilters: () => void;
}

export interface AttendanceDashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
}
export interface AttendanceData {
  data: any; // temporarily any to support both flat and grouped
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalRecords: number;
    uniqueEmployees: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    overtimeDays: number;
    totalHours: number;
    avgHours: number;
    attendanceRate: number;
  };
}

export interface AttendanceRecord {
  _id: string;
  employee: Employee;
  user: User;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "present" | "late" | "half-day" | "overtime";
  totalWorkHours?: number;
  workingHours?: {
    actual: number;
    expected: number;
  };
  notes?: string;
  location?: {
    type: string;
    coordinates?: number[];
  };
  breaks?: Array<{
    start: string;
    end: string;
    duration: number;
  }>;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  hoursWorked?: number;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  overtimeDays: number;
  totalHours: number;
  avgHours: number;
}

export interface CurrentStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  attendance?: AttendanceRecord;
  canCheckIn: boolean;
  canCheckOut: boolean;
}
export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord;
  warnings?: string[];
}

export interface AttendanceListResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface AttendanceFilters {
  startDate: string;
  endDate: string;
  status: string;
  department: string;
  employeeId: string;
  groupBy: "employee" | "date" | "department" | "none";
}

export interface AttendanceData {
  data: any;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalRecords: number;
    uniqueEmployees: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    overtimeDays: number;
    totalHours: number;
    avgHours: number;
    attendanceRate: number;
  };
  departmentSummary?: Record<string, any>;
}

export interface AttendUser {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee" | "hr";
  companyName: string;
  companyprofileImage: string;
}