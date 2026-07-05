import { NextResponse } from "next/server";

type ErrorBody = {
  error: string;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(error: string, details?: unknown) {
  return NextResponse.json(
    details ? ({ error, details } satisfies ErrorBody) : ({ error } satisfies ErrorBody),
    { status: 400 },
  );
}

export function unauthorized(error = "Unauthorized", details?: unknown) {
  return NextResponse.json(
    details ? ({ error, details } satisfies ErrorBody) : ({ error } satisfies ErrorBody),
    { status: 401 },
  );
}

export function forbidden(error = "Forbidden", details?: unknown) {
  return NextResponse.json(
    details ? ({ error, details } satisfies ErrorBody) : ({ error } satisfies ErrorBody),
    { status: 403 },
  );
}

export function notFound(error = "Not found", details?: unknown) {
  return NextResponse.json(
    details ? ({ error, details } satisfies ErrorBody) : ({ error } satisfies ErrorBody),
    { status: 404 },
  );
}

export function serverError(error = "Something went wrong", details?: unknown) {
  return NextResponse.json(
    details ? ({ error, details } satisfies ErrorBody) : ({ error } satisfies ErrorBody),
    { status: 500 },
  );
}
