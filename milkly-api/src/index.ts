import { Hono } from "hono";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error-handler.js";
import { portalCors } from "./middleware/cors.js";
import { auth } from "./auth.js";

// Hono app with typed context variables
type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware chain: error handler → CORS → logger
app.use("*", errorHandler);
app.use("*", portalCors);
app.use("*", logger());

// Health check
app.get("/health", (c) => c.json({ data: { status: "ok", timestamp: new Date().toISOString() } }));

// better-auth routes
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw));

// Feature routes — stubs (filled in Task 4 + Task 5)
// These will be replaced with actual route imports after those tasks complete

export default app;

// Bun server
if (import.meta.main) {
  const port = 3000;
  console.log(`milkly-api listening on port ${port}`);
  Bun.serve({
    port,
    fetch: app.fetch,
  });
}
