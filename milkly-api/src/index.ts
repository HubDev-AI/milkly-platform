import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./middleware/error-handler.js";
import { portalCors } from "./middleware/cors.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { auth } from "./auth.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";
import { draftsRoutes } from "./routes/drafts.js";
import { newslettersRoutes } from "./routes/newsletters.js";
import { publicRoutes } from "./routes/public.js";
import { subscribersRoutes } from "./routes/subscribers.js";
import { distributionsRoutes } from "./routes/distributions.js";
import { templatesRoutes } from "./routes/templates.js";
import { aiRoutes } from "./routes/ai.js";

// Hono app with typed context variables
type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const app = new Hono<{ Variables: Variables }>();

// Middleware chain: error handler → security headers → CORS → logger
app.use("*", errorHandler);
app.use(
  "*",
  secureHeaders({
    xContentTypeOptions: "nosniff",
    xFrameOptions: "DENY",
  })
);
app.use("*", portalCors);
app.use("*", logger());

// Rate limiting per route group
app.use("/auth/*", rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: "rl:auth" }));
app.use("/public/*", rateLimit({ windowMs: 60 * 1000, max: 30, keyPrefix: "rl:public" }));
app.use("/drafts/*", rateLimit({ windowMs: 60 * 1000, max: 100, keyPrefix: "rl:drafts" }));
app.use("/newsletters/*", rateLimit({ windowMs: 60 * 1000, max: 100, keyPrefix: "rl:newsletters" }));
app.use("/subscribers/*", rateLimit({ windowMs: 60 * 1000, max: 100, keyPrefix: "rl:subscribers" }));
app.use("/distributions/*", rateLimit({ windowMs: 60 * 1000, max: 5, keyPrefix: "rl:distributions" }));
app.use("/templates/*", rateLimit({ windowMs: 60 * 1000, max: 100, keyPrefix: "rl:templates" }));
app.use("/ai/*", rateLimit({ windowMs: 60 * 1000, max: 100, keyPrefix: "rl:ai" }));

// better-auth built-in routes
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw));

// Application routes
app.route("/health", healthRoutes);
app.route("/auth", authRoutes);
app.route("/drafts", draftsRoutes);
app.route("/newsletters", newslettersRoutes);
app.route("/public", publicRoutes);
app.route("/subscribers", subscribersRoutes);
app.route("/distributions", distributionsRoutes);
app.route("/templates", templatesRoutes);
app.route("/ai", aiRoutes);

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
