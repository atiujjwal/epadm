import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  try {
    // Run git status or git diff on the target file
    const gitDiff = execSync("git diff src/styles/globals.css", { encoding: "utf-8" });
    const gitStatus = execSync("git status", { encoding: "utf-8" });
    return NextResponse.json({ success: true, gitStatus, gitDiff });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: details });
  }
}
