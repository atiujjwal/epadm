import { NextResponse } from "next/server";
import { z } from "zod";

export function phase3ApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message.startsWith("FORBIDDEN:") ? 403 : message.toLowerCase().includes("not found") ? 404 : 400;
  return NextResponse.json({ error: message.replace(/^FORBIDDEN:\s*/, "") }, { status });
}

export function deprecated(response: Response, successor: string) {
  const next = new Response(response.body, response);
  next.headers.set("Deprecation", "true");
  next.headers.set("Sunset", "2026-09-30");
  next.headers.set("Link", `<${successor}>; rel="successor-version"`);
  return next;
}
