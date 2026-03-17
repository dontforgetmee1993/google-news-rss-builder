import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { createSupabaseClient } from "../lib/supabase";
import type { Bindings, Variables } from "../types/env";

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// POST /api/auth/magic-link
auth.post("/magic-link", async (c) => {
  const body = await c.req.json();
  const { email } = body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "Valid email is required" }, 400);
  }
  const supabase = createSupabaseClient(c.env);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: c.env.FRONTEND_URL + "/auth/callback" },
  });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Magic link sent to your email" });
});

// GET /api/auth/me
auth.get("/me", authMiddleware, (c) => {
  return c.json({ user: c.get("user") });
});

// POST /api/auth/logout
auth.post("/logout", authMiddleware, (c) => {
  return c.json({ message: "Logged out" });
});

export default auth;
