import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings, Variables } from "./types/env";
import feedsRoutes from "./routes/feeds";
import authRoutes from "./routes/auth";
import rssProxyRoutes from "./routes/rss-proxy";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", cors({ origin: (origin, c) => origin || "*" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/api/feeds", feedsRoutes);
app.route("/api/auth", authRoutes);
app.route("/", rssProxyRoutes);

export default app;
