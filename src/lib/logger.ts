type LogMetadata = Record<string, any>;

export const logger = {
  info(message: string, meta?: LogMetadata) {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    );
  },
  warn(message: string, meta?: LogMetadata) {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    );
  },
  error(message: string, error?: Error | any, meta?: LogMetadata) {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
        timestamp: new Date().toISOString(),
        ...meta,
      }),
    );
  },
};
