import { InferSelectModel } from "drizzle-orm";
import { notices, messages, notificationLogs } from "./schema";

// --- ENTITIES ---
export type Notice = InferSelectModel<typeof notices>;
export type Message = InferSelectModel<typeof messages>;
export type NotificationLog = InferSelectModel<typeof notificationLogs>;

export type NoticePriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type MessageType = "TEXT" | "IMAGE" | "DOCUMENT";

// --- INPUTS ---

export interface CreateNoticeInput {
  title: string;
  content: string;
  priority?: NoticePriority;
  targetRoles?: string[]; // e.g. ["parent", "student"]
  expiresAt?: string;
}

export interface SendMessageInput {
  recipientId: string;
  content: string;
  threadId?: string; // Optional: if replying
  type?: MessageType;
  metadata?: Record<string, any>;
}

export interface SendNotificationInput {
  userId: string; // Who to alert
  channel: "SMS" | "WHATSAPP" | "PUSH";
  templateId: string; // e.g., "ABSENT_ALERT_V1"
  variables: Record<string, string>; // e.g., { name: "Rahul", date: "2023-10-10" }
}

// --- SYNC ---

export interface CommunicationSyncPullResponse {
  changes: {
    notices: { created: Notice[]; updated: Notice[]; deleted: string[] };
    messages: { created: Message[]; updated: Message[]; deleted: string[] };
  };
  timestamp: number;
}
