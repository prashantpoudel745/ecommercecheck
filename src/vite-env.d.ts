/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
  import { RegisterSWOptions } from 'vite-plugin-pwa/types';
  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}

declare module 'virtual:pwa-register/react' {
  import { SWControllerOptions } from 'vite-plugin-pwa/types';

  export function useRegisterSW(
    options?: SWControllerOptions
  ): {
    offlineReady: boolean;
    needRefresh: boolean;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}



export interface Investment {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  clientname: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentFormData {
  description: string;
  amount: number;
  category: string;
  clientname: string;
}

export interface Coordinates {
  lat?: number;
  lng?: number;
}

export interface Attendance {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  workingHours: {
    actual: number;
    expected: number;
  };
  notes?: string;
  employee: {
    name: string;
    department: string;
    position: string;
  };
  user: {
    username: string;
    email: string;
  };
}

export interface Status {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  attendance?: Attendance;
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface Summary {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  overtimeDays: number;
  totalHours: number;
  avgHours: number;
}

export interface Filters {
  startDate: string;
  endDate: string;
  status: string;
  page: number;
  limit: number;
}