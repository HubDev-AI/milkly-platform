import type { Context, Next } from "hono";
import { redis } from "../lib/redis.js";
import { AppError } from "milkly-shared/errors";
import { ErrorCode } from "milkly-shared/errors";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "rl" } = options;
  const windowSec = Math.ceil(windowMs / 1000);

  return async function rateLimitMiddleware(c: Context, next: Next): Promise<void> {
    const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
    const key = `${keyPrefix}:${ip}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > max) {
      throw new AppError(ErrorCode.RATE_LIMITED, "Too many requests, please try again later");
    }

    await next();
  };
}
