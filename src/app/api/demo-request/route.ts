import { withApiObservability } from "@/lib/observability/api-handler";
import { logger } from "@/lib/observability/logger";
import { NextRequest, NextResponse } from 'next/server';

/* ── Types ────────────────────────────────────────────────── */
interface DemoRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  teamSize?: string;
  message?: string;
  consentTimestamp: string;
  source: string;
}

/* ── Simple in-memory rate limiter ───────────────────────── */
// In production, replace with Redis-backed rate limiting (e.g. Upstash)
const requestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestMap.get(ip);

  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/* ── Sanitize string input ────────────────────────────────── */
function sanitize(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 1000).replace(/<[^>]*>/g, '');
}

/* ── Validate email format ────────────────────────────────── */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

/* ── POST handler ─────────────────────────────────────────── */
async function POSTHandler(request: NextRequest) {
  // Get client IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  let body: DemoRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  // Server-side validation (never trust the client)
  const firstName = sanitize(body.firstName);
  const lastName  = sanitize(body.lastName);
  const email     = sanitize(body.email).toLowerCase();
  const company   = sanitize(body.company);
  const role      = sanitize(body.role);
  const teamSize  = sanitize(body.teamSize);
  const message   = sanitize(body.message);

  if (!firstName || !lastName) {
    return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: 'Valid work email is required.' }, { status: 400 });
  }

  if (!company) {
    return NextResponse.json({ message: 'Company name is required.' }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ message: 'Role is required.' }, { status: 400 });
  }

  if (!body.consentTimestamp) {
    return NextResponse.json({ message: 'Consent is required.' }, { status: 400 });
  }

  // ── Forward to your CRM / email / notification system ──────
  //
  // Replace this section with your actual integration.
  // Options:
  //   - POST to HubSpot CRM forms API
  //   - Send via Resend / SendGrid / Postmark
  //   - Store in your database via Prisma
  //   - Trigger a Slack notification
  //
  // Example (Resend):
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'demos@epadm.io',
  //   to: 'sales@epadm.io',
  //   subject: `Demo request: ${firstName} ${lastName} — ${company}`,
  //   html: `<p>${firstName} ${lastName} (${email}) from ${company} requested a demo.</p>`,
  // });
  //
  // For now, log to console in development only
  if (process.env.NODE_ENV === 'development') {
    logger.info("Demo request received", {
      firstName, lastName, email: '(redacted)', company, role, teamSize,
      messageLength: message.length,
    });
  }

  return NextResponse.json(
    { message: 'Demo request received successfully.' },
    { status: 200 }
  );
}

// Disable GET on this route
async function GETHandler() {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}

export const POST = withApiObservability(POSTHandler);
export const GET = withApiObservability(GETHandler);
