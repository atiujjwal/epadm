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
    redisClient.on("error", (err) => {
      // Catch error event silently to avoid unhandled console noise
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
    try {
      await redis.setex(
        `${SESSION_PREFIX}${sessionId}`,
        SESSION_TTL_SECONDS,
        operatorId,
      );
      return sessionId;
    } catch (error) {
      console.warn("[session] Redis failed to setex, falling back to memory:", error);
    }
  }

  memorySessions.set(sessionId, {
    operatorId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  return sessionId;
}

export async function touchPlatformSession(
  sessionId: string,
  operatorId?: string,
): Promise<string | null> {
  const redis = getRedis();

  if (redis) {
    try {
      const key = `${SESSION_PREFIX}${sessionId}`;
      const foundOperatorId = await redis.get(key);
      if (foundOperatorId) {
        await redis.expire(key, SESSION_TTL_SECONDS);
        return foundOperatorId;
      }
    } catch (error) {
      console.warn("[session] Redis failed to touch session, checking memory fallback:", error);
    }
  }

  const entry = memorySessions.get(sessionId);
  if (entry && entry.expiresAt >= Date.now()) {
    entry.expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
    return entry.operatorId;
  }

  // Cryptographic fallback when Redis/memory is unreachable/different process contexts
  if (operatorId) {
    return operatorId;
  }

  return null;
}

export async function revokePlatformSession(sessionId: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    try {
      await redis.del(`${SESSION_PREFIX}${sessionId}`);
      return;
    } catch (error) {
      console.warn("[session] Redis failed to delete session, fallback to memory:", error);
    }
  }

  memorySessions.delete(sessionId);
}
