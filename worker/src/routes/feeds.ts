import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { createSupabaseAdmin } from "../lib/supabase";
import { buildGoogleNewsUrl } from "../lib/url-builder";
import { createFeedSchema, updateFeedSchema, buildUrlSchema } from "../lib/validators";
import type { Bindings, Variables } from "../types/env";
import type { Feed } from "../types/feed";

const feeds = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/feeds - list user's feeds
feeds.get("/", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const db = createSupabaseAdmin(c.env);
  const page = parseInt(c.req.query("page") || "1");
  const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let query = db.from("feeds").select("*", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error, count } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ feeds: data as Feed[], total: count || 0, page });
});

// POST /api/feeds/build-url - no auth required (must be before /:id)
feeds.post("/build-url", async (c) => {
  const body = await c.req.json();
  const parsed = buildUrlSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  try {
    const url = buildGoogleNewsUrl(parsed.data);
    return c.json({ url });
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }
});

// POST /api/feeds/preview - no auth required (must be before /:id)
feeds.post("/preview", async (c) => {
  const body = await c.req.json();
  const { url } = body as { url?: string };
  if (!url) return c.json({ error: "url is required" }, 400);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; GoogleNewsRSSBuilder/1.0)" } });
    if (!res.ok) return c.json({ error: `Upstream returned ${res.status}` }, 502);
    const xml = await res.text();
    return c.json({ xml });
  } catch (e: any) {
    return c.json({ error: e.message }, 502);
  }
});

// POST /api/feeds - create feed
feeds.post("/", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = createFeedSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const input = parsed.data;
  let generated_url: string;
  try {
    generated_url = buildGoogleNewsUrl(input);
  } catch (e: any) {
    return c.json({ error: e.message }, 400);
  }

  const db = createSupabaseAdmin(c.env);
  const { data, error } = await db.from("feeds").insert({ ...input, user_id: user.id, generated_url }).select().single();
  if (error) {
    if (error.code === "23505") return c.json({ error: "Slug already exists" }, 409);
    return c.json({ error: error.message }, 500);
  }

  const host = new URL(c.req.url).origin;
  return c.json({ feed: data as Feed, proxy_url: `${host}/rss/${input.slug}` }, 201);
});

// GET /api/feeds/:id - get single feed
feeds.get("/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const db = createSupabaseAdmin(c.env);
  const { data, error } = await db.from("feeds").select("*").eq("id", c.req.param("id")).eq("user_id", user.id).single();
  if (error || !data) return c.json({ error: "Feed not found" }, 404);
  return c.json({ feed: data as Feed });
});

// PUT /api/feeds/:id - update feed
feeds.put("/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const parsed = updateFeedSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);

  const db = createSupabaseAdmin(c.env);
  const { data: existing, error: fetchErr } = await db.from("feeds").select("*").eq("id", c.req.param("id")).eq("user_id", user.id).single();
  if (fetchErr || !existing) return c.json({ error: "Feed not found" }, 404);

  const updates = parsed.data;
  const merged = { ...existing, ...updates };
  let generated_url = existing.generated_url;
  const urlFields = ["keywords","exact_phrases","excluded_keywords","or_keywords","domains","country","language","ceid","time_range","date_after","date_before"];
  const urlChanged = urlFields.some((k) => k in updates);
  if (urlChanged) {
    try {
      generated_url = buildGoogleNewsUrl(merged);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  }

  const { data, error } = await db.from("feeds").update({ ...updates, generated_url }).eq("id", c.req.param("id")).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ feed: data as Feed });
});

// DELETE /api/feeds/:id
feeds.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const db = createSupabaseAdmin(c.env);
  const { error: fetchErr } = await db.from("feeds").select("id").eq("id", c.req.param("id")).eq("user_id", user.id).single();
  if (fetchErr) return c.json({ error: "Feed not found" }, 404);

  const { error } = await db.from("feeds").delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Feed deleted" });
});

export default feeds;
