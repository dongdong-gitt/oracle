import Redis from 'ioredis';

/**
 * 基于 Redis 滑动窗口的 API 限流模块
 * 支持按 IP / userId 进行限流
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 3000,
    });
    redis.on('error', (err) => {
      console.error('[RateLimit] Redis error:', err.message);
    });
    return redis;
  } catch {
    return null;
  }
}

export interface RateLimitConfig {
  /** 限流窗口大小（秒） */
  windowSec: number;
  /** 窗口内最大请求数 */
  maxRequests: number;
  /** Redis key 前缀 */
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSec?: number;
}

/**
 * 内存限流 fallback（当 Redis 不可用时使用）
 * 注意：多实例部署时无法跨进程共享状态，仅适用于单机开发
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowSec * 1000 });
    return { allowed: true, remaining: config.maxRequests - 1, limit: config.maxRequests };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, limit: config.maxRequests, retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.maxRequests - entry.count, limit: config.maxRequests };
}

// 定期清理过期的内存条目
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(memoryStore.keys());
  for (const key of keys) {
    const entry = memoryStore.get(key);
    if (entry && now >= entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

/**
 * 执行限流检查
 * @param identifier 限流标识（如 userId、IP 地址）
 * @param config 限流配置
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const prefix = config.prefix || 'rl';
  const key = `${prefix}:${identifier}`;

  const client = getRedis();
  if (!client) {
    return memoryRateLimit(key, config);
  }

  try {
    const now = Date.now();
    const windowMs = config.windowSec * 1000;
    const windowStart = now - windowMs;

    // 使用 sorted set 实现滑动窗口
    const pipeline = client.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart); // 移除窗口外的旧请求
    pipeline.zcard(key);                             // 统计窗口内的请求数
    pipeline.zadd(key, now.toString(), `${now}:${Math.random().toString(36).slice(2, 8)}`);
    pipeline.expire(key, config.windowSec + 1);      // 设置 key 过期

    const results = await pipeline.exec();
    const currentCount = (results?.[1]?.[1] as number) || 0;

    if (currentCount >= config.maxRequests) {
      // 超限：移除刚刚添加的请求记录
      await client.zremrangebyscore(key, now, now + 1);
      return {
        allowed: false,
        remaining: 0,
        limit: config.maxRequests,
        retryAfterSec: config.windowSec,
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      limit: config.maxRequests,
    };
  } catch (err) {
    console.error('[RateLimit] Redis check failed, falling back to memory:', err);
    return memoryRateLimit(key, config);
  }
}

/**
 * 预定义的限流配置
 */
export const RATE_LIMITS = {
  /** AI 聊天：每用户每分钟 10 次 */
  aiChat: { windowSec: 60, maxRequests: 10, prefix: 'rl:ai_chat' },
  /** 八字计算：每 IP 每分钟 20 次 */
  baziCalc: { windowSec: 60, maxRequests: 20, prefix: 'rl:bazi' },
  /** 支付操作：每用户每分钟 5 次 */
  payment: { windowSec: 60, maxRequests: 5, prefix: 'rl:payment' },
  /** 登录尝试：每 IP 每 15 分钟 10 次 */
  login: { windowSec: 900, maxRequests: 10, prefix: 'rl:login' },
} as const;
