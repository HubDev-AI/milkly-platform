import { cors } from "hono/cors";
import { env } from "../env.js";

export const portalCors = cors({
  origin: [env.APP_URL, env.NEWS_URL, env.EMAIL_URL, env.AI_URL, env.LANDING_URL],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
