import "server-only";

import { logger } from "@/lib/observability/logger";

type ApiHandler<TArgs extends unknown[]> = (
  ...args: TArgs
) => Response | Promise<Response>;

export function withApiObservability<TArgs extends unknown[]>(
  handler: ApiHandler<TArgs>,
): ApiHandler<TArgs> {
  return async (...args: TArgs) => {
    const request = args.find(
      (argument): argument is TArgs[number] & Request => argument instanceof Request,
    );
    const requestId =
      request?.headers.get("x-request-id") ?? crypto.randomUUID();
    const startedAt = performance.now();
    let status = 500;

    try {
      const response = await handler(...args);
      status = response.status;
      if (!response.headers.has("x-request-id")) {
        response.headers.set("x-request-id", requestId);
      }
      return response;
    } finally {
      logger.info("API request completed", {
        requestId,
        tenantId: request?.headers.get("x-tenant-id") ?? undefined,
        path: request ? new URL(request.url).pathname : "unknown",
        duration: Math.round(performance.now() - startedAt),
        status,
      });
    }
  };
}
