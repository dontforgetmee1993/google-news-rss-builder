import { Context, Next } from "hono";
import { getUser } from "../lib/supabase";
import type { Bindings, Variables } from "../types/env";

export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const user = await getUser(c.env, token);

  if (!user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("user", user);
  await next();
}
