import type { Context, Next } from "hono";
import { redis } from "../lib/redis.js";
import { AppError } from "milkly-shared/errors";
import { ErrorCode } from "milkly-shared/errors";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

const IP_V4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IP_V6_PATTERN = /^[0-9a-fA-F:]+$/;

/**
 * Extract the client IP from request headers.
 * Takes the rightmost entry from x-forwarded-for (most recently appended by
 * the trusted reverse proxy closest to the server), falling back to
 * x-real-ip, then "unknown".
 */
function extractClientIp(c: Context): string {
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",");
    // Rightmost entry is the one appended by the trusted proxy
    const candidate = parts[parts.length - 1]?.trim() ?? "";
    if (candidate && (IP_V4_PATTERN.test(candidate) || IP_V6_PATTERN.test(candidate))) {
      return candidate;
    }
  }

  const realIp = c.req.header("x-real-ip")?.trim() ?? "";
  if (realIp && (IP_V4_PATTERN.test(realIp) || IP_V6_PATTERN.test(realIp))) {
    return realIp;
  }

  return "unknown";
}

export { extractClientIp };

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "rl" } = options;
  const windowSec = Math.ceil(windowMs / 1000);

  return async function rateLimitMiddleware(c: Context, next: Next): Promise<void> {
    const ip = extractClientIp(c);
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
