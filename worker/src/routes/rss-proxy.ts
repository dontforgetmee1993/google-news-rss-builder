import { Hono } from "hono";
import { createSupabaseAdmin } from "../lib/supabase";
import { parseRSSXml } from "../lib/rss-parser";
import { getCachedResponse, setCachedResponse } from "../lib/cache";
import type { Bindings, Variables } from "../types/env";

const rssProxy = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const NOT_FOUND_XML = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Feed not found</title><description>No feed with this slug exists or it is inactive.</description></channel></rss>`;
const ERROR_XML = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Upstream error</title><description>Could not fetch feed from Google News.</description></channel></rss>`;

// GET /rss/:slug  — returns raw RSS XML (proxied from Google News)
rssProxy.get("/rss/:slug", async (c) => {
  const slug = c.req.param("slug");
  const request = c.req.raw;

  // 1. Check CF cache
  const cached = await getCachedResponse(request);
  if (cached) return cached;

  // 2. Lookup feed in DB
  const db = createSupabaseAdmin(c.env);
  const { data: feed, error } = await db
    .from("feeds")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !feed) {
    return c.body(NOT_FOUND_XML, 404, { "Content-Type": "application/rss+xml; charset=utf-8" });
  }

  // 3. Fetch from Google News
  let xml: string;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const upstream = await fetch(feed.generated_url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GoogleNewsRSSBuilder/1.0; +https://github.com)" },
      signal: controller.signal,
    });
    if (!upstream.ok) {
      return c.body(ERROR_XML, 502, { "Content-Type": "application/rss+xml; charset=utf-8" });
    }
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("xml") && !contentType.includes("rss")) {
      return c.body(
        `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Rate limited</title><description>Google News returned a non-XML response. You may be rate limited. Please try again later.</description></channel></rss>`,
        503,
        { "Content-Type": "application/rss+xml; charset=utf-8" }
      );
    }
    xml = await upstream.text();
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return c.body(
        `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Timeout</title><description>Google News request timed out.</description></channel></rss>`,
        503,
        { "Content-Type": "application/rss+xml; charset=utf-8" }
      );
    }
    return c.body(ERROR_XML, 502, { "Content-Type": "application/rss+xml; charset=utf-8" });
  } finally {
    clearTimeout(timeout);
  }

  // 4. Build response
  const response = new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "X-Feed-Name": feed.name,
      "Cache-Control": "public, max-age=900",
    },
  });

  // 5. Cache + async DB update (access_count, last_accessed)
  c.executionCtx.waitUntil(
    Promise.all([
      setCachedResponse(request, response.clone()),
      db.from("feeds").update({ access_count: feed.access_count + 1, last_accessed: new Date().toISOString() }).eq("id", feed.id),
    ])
  );

  return response;
});

// GET /rss/:slug.json  — returns parsed RSS as JSON
rssProxy.get("/rss/:slug{.+\\.json}", async (c) => {
  const rawSlug = c.req.param("slug");
  const slug = rawSlug.replace(/\.json$/, "");

  const db = createSupabaseAdmin(c.env);
  const { data: feed, error } = await db
    .from("feeds")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !feed) return c.json({ error: "Feed not found" }, 404);

  try {
    const upstream = await fetch(feed.generated_url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GoogleNewsRSSBuilder/1.0)" },
    });
    if (!upstream.ok) return c.json({ error: `Upstream returned ${upstream.status}` }, 502);
    const xml = await upstream.text();
    const parsed = parseRSSXml(xml);
    return c.json(parsed);
  } catch (e: any) {
    return c.json({ error: e.message }, 502);
  }
});

export default rssProxy;
