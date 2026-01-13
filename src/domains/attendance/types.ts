import { InferSelectModel } from "drizzle-orm";
import { attendanceLogs, devices, leaves } from "./schema";

// --- ENTITIES ---
export type AttendanceLog = InferSelectModel<typeof attendanceLogs>;
export type Device = InferSelectModel<typeof devices>;
export type Leave = InferSelectModel<typeof leaves>;

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "ON_LEAVE";

// --- INPUTS ---

export interface MarkAttendanceInput {
  studentId: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  status: AttendanceStatus;
  remarks?: string;
  // If manual, timestamps are often irrelevant, but can be passed
  checkInTime?: string;
}

export interface BulkAttendanceInput {
  classId: string;
  date: string;
  records: Array<{ studentId: string; status: AttendanceStatus }>;
}

export interface RegisterDeviceInput {
  serialNumber: string;
  name: string;
  location?: string;
}

// --- SYNC ---

export interface AttendanceSyncPullResponse {
  changes: {
    attendance_logs: {
      created: AttendanceLog[];
      updated: AttendanceLog[];
      deleted: string[]; // IDs
    };
  };
  timestamp: number;
}
