import { Context, Next } from "hono";
import type { Bindings, Variables } from "../types/env";

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000; // 1 minute

function checkLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true;
}

/** Rate limiter for RSS proxy endpoints: 60 req/min per IP */
export function rssRateLimit(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "unknown";
  if (!checkLimit(`rss:${ip}`, 60)) {
    const retryAfter = Math.ceil(WINDOW_MS / 1000);
    return c.json({ error: "Too Many Requests" }, 429, { "Retry-After": String(retryAfter) });
  }
  return next();
}

/** Rate limiter for API endpoints: 20 req/min per IP */
export function apiRateLimit(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const ip = c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "unknown";
  if (!checkLimit(`api:${ip}`, 20)) {
    const retryAfter = Math.ceil(WINDOW_MS / 1000);
    return c.json({ error: "Too Many Requests" }, 429, { "Retry-After": String(retryAfter) });
  }
  return next();
}
