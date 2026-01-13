import { z } from "zod";

export const LogConsentSchema = z.object({
  scope: z.enum(["academic", "biometric", "marketing"]),
  parentDidHash: z.string(), // e.g. SHA256 of Aadhaar/Phone
  verificationMethod: z.enum(["otp", "biometric", "manual"]),
  status: z.enum(["granted", "withdrawn"]),
  ipAddress: z
    .string()
    .regex(
      /^(?:\d{1,3}\.){3}\d{1,3}$|^\[[0-9a-fA-F:]+\]$/,
      "Invalid IP address"
    )
    .optional(),
});

export type LogConsentInput = z.infer<typeof LogConsentSchema>;
