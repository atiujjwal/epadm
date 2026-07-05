import { Redis } from "ioredis";
import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import * as fs from "fs";
import path from "path";

const METERING_QUEUE = "queue:platform_metering_buffer";

const FALLBACK_LOG_PATH =
  process.env.METERING_FALLBACK_PATH ??
  path.join(process.cwd(), ".data", "metering-buffer.jsonl");

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

type UsagePayload = {
  tenantId: string;
  tokens: number;
  cost: number;
  timestamp: number;
};

async function ensureFallbackDir(): Promise<void> {
  await mkdir(path.dirname(FALLBACK_LOG_PATH), { recursive: true });
}

async function appendToFallbackLog(serialized: string): Promise<void> {
  try {
    await ensureFallbackDir();
    await appendFile(FALLBACK_LOG_PATH, `${serialized}\n`, "utf8");
  } catch (error) {
    console.error("[metering] Failed to append to fallback file:", error);
  }
}

async function drainFallbackLog(batchSize: number): Promise<UsagePayload[]> {
  try {
    if (!fs.existsSync(FALLBACK_LOG_PATH)) {
      return [];
    }

    const content = await readFile(FALLBACK_LOG_PATH, "utf8");
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 0) {
      return [];
    }

    const batch = lines.slice(0, batchSize);
    const remaining = lines.slice(batchSize);

    await ensureFallbackDir();
    await writeFile(
      FALLBACK_LOG_PATH,
      remaining.length > 0 ? `${remaining.join("\n")}\n` : "",
      "utf8",
    );

    return batch.map((line) => JSON.parse(line) as UsagePayload);
  } catch (error) {
    console.error("[metering] Failed to drain fallback file:", error);
    return [];
  }
}

export async function logAIVariableCost(
  tenantId: string,
  modelName: string,
  promptTokens: number,
  completionTokens: number,
): Promise<void> {
  const tokenCostMultiplier = modelName.includes("gpt-4") ? 0.0025 : 0.00015;
  const computedCost = (promptTokens + completionTokens) * tokenCostMultiplier;

  const usagePayload: UsagePayload = {
    tenantId,
    tokens: promptTokens + completionTokens,
    cost: computedCost,
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(usagePayload);
  const redis = getRedis();

  if (redis) {
    try {
      await redis.rpush(METERING_QUEUE, serialized);
      return;
    } catch (error) {
      console.warn("[metering] Redis unavailable, using file fallback:", error);
    }
  }

  await appendToFallbackLog(serialized);
}

export async function drainMeteringBuffer(
  batchSize = 500,
): Promise<UsagePayload[]> {
  // Always drain local file logs first so we process backlog
  const fileItems = await drainFallbackLog(batchSize);
  if (fileItems.length > 0) {
    return fileItems;
  }

  const redis = getRedis();

  if (redis) {
    try {
      const items: UsagePayload[] = [];
      for (let i = 0; i < batchSize; i++) {
        const raw = await redis.lpop(METERING_QUEUE);
        if (!raw) {
          break;
        }
        items.push(JSON.parse(raw) as UsagePayload);
      }
      return items;
    } catch (error) {
      console.warn("[metering] Redis lpop failed:", error);
    }
  }

  return [];
}

export { METERING_QUEUE, FALLBACK_LOG_PATH };
