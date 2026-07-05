import "server-only";
import { Redis } from "ioredis";
import { randomUUID } from "crypto";

const SESSION_PREFIX = "platform:session:";
const SESSION_TTL_SECONDS = 15 * 60;

type MemoryEntry = { operatorId: string; expiresAt: number };

const memorySessions = new Map<string, MemoryEntry>();

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

export async function createPlatformSession(
  operatorId: string,
): Promise<string> {
  const sessionId = randomUUID();
  const redis = getRedis();

  if (redis) {
    await redis.setex(
      `${SESSION_PREFIX}${sessionId}`,
      SESSION_TTL_SECONDS,
      operatorId,
    );
    return sessionId;
  }

  memorySessions.set(sessionId, {
    operatorId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  return sessionId;
}

export async function touchPlatformSession(
  sessionId: string,
): Promise<string | null> {
  const redis = getRedis();

  if (redis) {
    const key = `${SESSION_PREFIX}${sessionId}`;
    const operatorId = await redis.get(key);
    if (!operatorId) {
      return null;
    }
    await redis.expire(key, SESSION_TTL_SECONDS);
    return operatorId;
  }

  const entry = memorySessions.get(sessionId);
  if (!entry || entry.expiresAt < Date.now()) {
    memorySessions.delete(sessionId);
    return null;
  }

  entry.expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  return entry.operatorId;
}

export async function revokePlatformSession(sessionId: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
    return;
  }

  memorySessions.delete(sessionId);
}
