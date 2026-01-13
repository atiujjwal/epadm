
export interface SyncPullResult {
  changes: {
    // Keys match table names in the mobile app schema
    attendance_logs?: { created: any[]; updated: any[]; deleted: string[] };
    notices?: { created: any[]; updated: any[]; deleted: string[] };
    messages?: { created: any[]; updated: any[]; deleted: string[] };
    // Add other synced tables here
  };
  timestamp: number; // Server timestamp to be saved by client as 'last_pulled_at'
}

export interface SyncPushRequest {
  changes: {
    attendance_logs?: { created: any[]; updated: any[]; deleted: string[] };
    messages?: { created: any[]; updated: any[]; deleted: string[] };
  };
  lastPulledAt: number;
}
