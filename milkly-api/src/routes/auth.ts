import crypto from "node:crypto";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { z } from "zod";
import { zValidator } from "../middleware/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { generateSsoToken, exchangeSsoToken } from "../services/sso.js";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { auth } from "../auth.js";
import { env } from "../env.js";

type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const authRoutes = new Hono<{ Variables: Variables }>();

// POST /auth/sso/token — authenticated, generates SSO redirect URL
authRoutes.post(
  "/sso/token",
  requireAuth,
  zValidator(
    "json",
    z.object({ targetPortal: z.enum(["app", "news", "email", "ai", "landing"]) })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) throw new AppError(ErrorCode.AUTH_REQUIRED, "Authentication required");
    const { targetPortal } = c.req.valid("json");
    const result = await generateSsoToken(user.id, targetPortal);
    return c.json({ data: result });
  }
);

// POST /auth/sso/exchange — unauthenticated, creates session for requesting portal
authRoutes.post(
  "/sso/exchange",
  zValidator("json", z.object({ token: z.string().min(1), nonce: z.string().min(1) })),
  async (c) => {
    const { token, nonce } = c.req.valid("json");
    const origin = c.req.header("origin") ?? "";

    const userId = await exchangeSsoToken(token, nonce, origin);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, "User not found");
    }

    // Create a better-auth compatible session and set the session cookie
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? null,
        userAgent: c.req.header("user-agent") ?? null,
      },
    });

    setCookie(c, "better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "Lax",
      expires: expiresAt,
      path: "/",
    });

    return c.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
        },
      },
    });
  }
);

// PUT /auth/username — set/update username
authRoutes.put(
  "/username",
  requireAuth,
  zValidator(
    "json",
    z.object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9-]+$/, "Username may only contain letters, numbers, and hyphens"),
    })
  ),
  async (c) => {
    const user = c.get("user");
    if (!user) throw new AppError(ErrorCode.AUTH_REQUIRED, "Authentication required");
    const { username } = c.req.valid("json");

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing && existing.id !== user.id) {
      throw new AppError(ErrorCode.DUPLICATE, "Username is already taken", { field: "username" });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { username },
      select: { username: true },
    });

    return c.json({ data: updated });
  }
);

// POST /auth/logout-all — invalidate all sessions for the current user
authRoutes.post("/logout-all", requireAuth, async (c) => {
  const user = c.get("user");
  if (!user) throw new AppError(ErrorCode.AUTH_REQUIRED, "Authentication required");
  await prisma.session.deleteMany({ where: { userId: user.id } });
  return c.json({ data: { success: true } });
});

export { authRoutes };
