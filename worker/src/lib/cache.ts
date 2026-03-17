const CACHE_TTL = 900; // 15 minutes

/**
 * Returns a cached Response for the given request, or undefined if not cached.
 * NOTE: Cloudflare Cache API only works in production Workers, not in local wrangler dev.
 */
export async function getCachedResponse(request: Request): Promise<Response | undefined> {
  try {
    const cache = caches.default;
    const cached = await cache.match(request);
    return cached ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Stores a response in Cloudflare's cache with a 15-minute TTL.
 */
export async function setCachedResponse(request: Request, response: Response): Promise<void> {
  try {
    const cache = caches.default;
    const responseToCache = new Response(response.body, response);
    responseToCache.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
    await cache.put(request, responseToCache);
  } catch {
    // Swallow cache errors (e.g. local dev environment)
  }
}

/**
 * Invalidates the cached RSS response for a given feed slug.
 */
export async function invalidateCache(slug: string, baseUrl: string): Promise<void> {
  try {
    const cache = caches.default;
    const url = `${baseUrl}/rss/${slug}`;
    await cache.delete(new Request(url));
  } catch {
    // Swallow cache errors
  }
}
