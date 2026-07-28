import { withApiObservability } from "@/lib/observability/api-handler";
import { NextRequest, NextResponse } from 'next/server';

const requestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestMap.get(ip);
  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitize(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, 2000).replace(/<[^>]*>/g, '');
}

async function POSTHandler(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ message: 'Invalid request.' }, { status: 400 }); }

  const name    = sanitize(body.name);
  const email   = sanitize(body.email).toLowerCase();
  const subject = sanitize(body.subject);
  const message = sanitize(body.message);

  if (!name) return NextResponse.json({ message: 'Name is required.' }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
  }
  if (!message) return NextResponse.json({ message: 'Message is required.' }, { status: 400 });

  // Wire up your email/CRM provider here (see demo-request/route.ts for examples)
  if (process.env.NODE_ENV === 'development') {
    console.log('[CONTACT]', { name, subject, messageLength: message.length });
  }

  return NextResponse.json({ message: 'Message received.' }, { status: 200 });
}

async function GETHandler() {
  return NextResponse.json({ message: 'Method not allowed.' }, { status: 405 });
}

export const POST = withApiObservability(POSTHandler);
export const GET = withApiObservability(GETHandler);
