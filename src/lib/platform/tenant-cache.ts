import "server-only";
import { Redis } from "ioredis";

const TENANT_ACTIVE_PREFIX = "tenant:active:";
const TENANT_ACTIVE_TTL_SECONDS = 60 * 60 * 24;

const memoryTenantStatus = new Map<string, boolean>();

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
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
    await redis.setex(
      `${TENANT_ACTIVE_PREFIX}${tenantId}`,
      TENANT_ACTIVE_TTL_SECONDS,
      isActive ? "1" : "0",
    );
    return;
  }

  memoryTenantStatus.set(tenantId, isActive);
}

export async function isTenantActiveCached(
  tenantId: string,
): Promise<boolean | null> {
  const redis = getRedis();

  if (redis) {
    const value = await redis.get(`${TENANT_ACTIVE_PREFIX}${tenantId}`);
    if (value === null) {
      return null;
    }
    return value === "1";
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
    await redis.del(`${TENANT_ACTIVE_PREFIX}${tenantId}`);
    return;
  }

  memoryTenantStatus.delete(tenantId);
}

export async function setActiveModulesCache(
  tenantId: string,
  modules: string[],
): Promise<void> {
  const redis = getRedis();

  if (redis) {
    await redis.setex(
      `${TENANT_MODULES_PREFIX}${tenantId}`,
      TENANT_ACTIVE_TTL_SECONDS,
      modules.join(","),
    );
    return;
  }

  memoryTenantModules.set(tenantId, modules);
}

export async function getActiveModulesCached(
  tenantId: string,
): Promise<string[] | null> {
  const redis = getRedis();

  if (redis) {
    const value = await redis.get(`${TENANT_MODULES_PREFIX}${tenantId}`);
    if (value === null) {
      return null;
    }
    return value.split(",").filter(Boolean);
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
    await redis.del(`${TENANT_MODULES_PREFIX}${tenantId}`);
    return;
  }

  memoryTenantModules.delete(tenantId);
}
