import "server-only";
import { Redis } from "ioredis";

const TENANT_ACTIVE_PREFIX = "tenant:active:";
const TENANT_ACTIVE_TTL_SECONDS = 60 * 60 * 24;

const memoryTenantStatus = new Map<string, boolean>();

let redisClient: Redis | null = null;
let redisUnavailableUntil = 0;
let redisFallbackNoticeShown = false;

const REDIS_RETRY_DELAY_MS = 30_000;

function markRedisAvailable() {
  redisUnavailableUntil = 0;
  redisFallbackNoticeShown = false;
}

function markRedisUnavailable(operation: string, error: unknown) {
  redisUnavailableUntil = Date.now() + REDIS_RETRY_DELAY_MS;

  if (redisFallbackNoticeShown) {
    return;
  }

  redisFallbackNoticeShown = true;
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(
    `[tenant-cache] Redis ${operation} failed; using memory fallback and retrying Redis in ${REDIS_RETRY_DELAY_MS / 1000}s: ${detail}`,
  );
}

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (Date.now() < redisUnavailableUntil) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    redisClient.on("error", () => {
      // Catch error event silently to avoid unhandled console noise
    });
  }

  return redisClient;
}

export async function setTenantActiveCache(
  tenantId: string,
  isActive: boolean,
): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.setex(
        `${TENANT_ACTIVE_PREFIX}${tenantId}`,
        TENANT_ACTIVE_TTL_SECONDS,
        isActive ? "1" : "0",
      );
      markRedisAvailable();
      return;
    } catch (error) {
      markRedisUnavailable("setex", error);
    }
  }

  memoryTenantStatus.set(tenantId, isActive);
}

export async function isTenantActiveCached(
  tenantId: string,
): Promise<boolean | null> {
  const redis = getRedis();

  if (redis) {
    try {
      const value = await redis.get(`${TENANT_ACTIVE_PREFIX}${tenantId}`);
      markRedisAvailable();
      if (value !== null) {
        return value === "1";
      }
    } catch (error) {
      markRedisUnavailable("get", error);
    }
  }

  if (!memoryTenantStatus.has(tenantId)) {
    return null;
  }

  return memoryTenantStatus.get(tenantId) ?? null;
}

const TENANT_MODULES_PREFIX = "tenant:modules:";
const memoryTenantModules = new Map<string, string[]>();

export async function invalidateTenantActiveCache(
  tenantId: string,
): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.del(`${TENANT_ACTIVE_PREFIX}${tenantId}`);
      markRedisAvailable();
      return;
    } catch (error) {
      markRedisUnavailable("del", error);
    }
  }

  memoryTenantStatus.delete(tenantId);
}

export async function setActiveModulesCache(
  tenantId: string,
  modules: string[],
): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.setex(
        `${TENANT_MODULES_PREFIX}${tenantId}`,
        TENANT_ACTIVE_TTL_SECONDS,
        modules.join(","),
      );
      markRedisAvailable();
      return;
    } catch (error) {
      markRedisUnavailable("setex modules", error);
    }
  }

  memoryTenantModules.set(tenantId, modules);
}

export async function getActiveModulesCached(
  tenantId: string,
): Promise<string[] | null> {
  const redis = getRedis();

  if (redis) {
    try {
      const value = await redis.get(`${TENANT_MODULES_PREFIX}${tenantId}`);
      markRedisAvailable();
      if (value !== null) {
        return value.split(",").filter(Boolean);
      }
    } catch (error) {
      markRedisUnavailable("get modules", error);
    }
  }

  if (!memoryTenantModules.has(tenantId)) {
    return null;
  }

  return memoryTenantModules.get(tenantId) ?? null;
}

export async function invalidateTenantModulesCache(
  tenantId: string,
): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.del(`${TENANT_MODULES_PREFIX}${tenantId}`);
      markRedisAvailable();
      return;
    } catch (error) {
      markRedisUnavailable("del modules", error);
    }
  }

  memoryTenantModules.delete(tenantId);
}
