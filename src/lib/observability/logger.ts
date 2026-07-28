type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
  [key: string]: unknown;
}

function serializeError(error: unknown): unknown {
  if (!(error instanceof Error)) return error;
  return { name: error.name, message: error.message, stack: error.stack };
}

function log(level: LogLevel, message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === "development") {
    const write = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    write(
      `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`,
      Object.keys(context).length > 0 ? context : "",
    );
    return;
  }

  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

export const logger = {
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (
    message: string,
    errorOrContext?: unknown,
    context: LogContext = {},
  ) => {
    if (
      errorOrContext &&
      typeof errorOrContext === "object" &&
      !(errorOrContext instanceof Error) &&
      context &&
      Object.keys(context).length === 0
    ) {
      log("error", message, errorOrContext as LogContext);
      return;
    }
    log("error", message, {
      ...context,
      ...(errorOrContext === undefined
        ? {}
        : { error: serializeError(errorOrContext) }),
    });
  },
  debug: (message: string, context?: LogContext) => log("debug", message, context),
};
