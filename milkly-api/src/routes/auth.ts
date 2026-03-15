import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { generateSsoToken, exchangeSsoToken } from "../services/sso.js";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { auth } from "../auth.js";

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

    // Create a better-auth session for this user on this portal's origin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, "User not found");
    }

    // Return user data — the portal sets up its own session via better-auth
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
