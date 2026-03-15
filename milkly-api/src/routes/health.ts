import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) =>
  c.json({ data: { status: "ok", timestamp: new Date().toISOString() } })
);

export { healthRoutes };
