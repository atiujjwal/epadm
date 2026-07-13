import { getCtx } from "@/lib/context";
import { NextResponse } from "next/server";

/**
 * Higher-order function to wrap API Route Handlers or Server Actions
 * and reject requests (403 Forbidden/Throw) if the tenant is not subscribed to the module.
 */
export function requireModule(moduleName: string) {
  return function <T extends (...args: never[]) => Promise<unknown>>(
    handler: T,
  ): (...args: Parameters<T>) => Promise<NextResponse | Awaited<ReturnType<T>>> {
    return async function (...args: Parameters<T>) {
      try {
        const ctx = await getCtx();

        if (!ctx.activeModules.includes(moduleName)) {
          const isApi = (args[0] as unknown) instanceof Request;
          if (isApi) {
            return NextResponse.json(
              { error: `Institution is not subscribed to module: ${moduleName}` },
              { status: 403 },
            ) as NextResponse;
          }
          throw new Error(`Forbidden: Institution is not subscribed to module: ${moduleName}`);
        }

        return (await handler(...args)) as Awaited<ReturnType<T>>;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("subscribed to module")) {
          throw error;
        }

        const isApi = (args[0] as unknown) instanceof Request;
        if (isApi) {
          return NextResponse.json(
            { error: message || "Internal server error" },
            { status: message === "Missing tenant or user context in headers" ? 401 : 500 },
          ) as NextResponse;
        }
        throw error;
      }
    };
  };
}

/**
 * Procedural function to assert module subscription anywhere inside Server Components or Actions.
 */
export async function assertModule(moduleName: string): Promise<void> {
  const ctx = await getCtx();
  if (!ctx.activeModules.includes(moduleName)) {
    throw new Error(`Forbidden: Institution is not subscribed to module: ${moduleName}`);
  }
}
