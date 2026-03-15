import type { Context, Next } from "hono";
import { auth } from "../auth.js";
import { AppError } from "milkly-shared/errors";
import { ErrorCode } from "milkly-shared/errors";

export async function requireAuth(c: Context, next: Next): Promise<void> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new AppError(ErrorCode.AUTH_REQUIRED, "Authentication required");
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}
