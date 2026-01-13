import { z } from "zod";

// Input Schema for PULL (Server -> App)
export const SyncPullQuerySchema = z.object({
  last_pulled_at: z.string().optional(), // Timestamp or null for initial sync
  schema_version: z.string().optional(), // For migration safety
});

// Output Schema for PULL
export type SyncPullResponse = {
  changes: {
    attendance_logs: {
      created: Array<any>; // Full record objects
      updated: Array<any>;
      deleted: Array<string>; // Array of IDs
    };
    students: {
      created: Array<any>;
      updated: Array<any>;
      deleted: Array<string>;
    };
    // ... potentially other synced tables TODO
  };
  timestamp: number; // The new 'last_pulled_at' for the client
};

// Input Schema for PUSH (App -> Server)
export const SyncPushBodySchema = z.object({
  changes: z.object({
    attendance_logs: z
      .object({
        created: z.record(z.string(), z.any()).optional(),
        updated: z.record(z.string(), z.any()).optional(),
        deleted: z.array(z.string()),
      })
      .optional(),
  }),
});
