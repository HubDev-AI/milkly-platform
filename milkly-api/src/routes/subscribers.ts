import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { auth } from "../auth.js";

type Variables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

const subscribersRoutes = new Hono<{ Variables: Variables }>();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

// GET / — creator's subscribers, paginated, with counts
subscribersRoutes.get(
  "/",
  requireAuth,
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const [subscribers, total, confirmed] = await Promise.all([
      prisma.subscriber.findMany({
        where: { creatorId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscriber.count({ where: { creatorId: user.id } }),
      prisma.subscriber.count({ where: { creatorId: user.id, confirmed: true } }),
    ]);

    return c.json({
      data: {
        subscribers,
        counts: { total, confirmed, unconfirmed: total - confirmed },
        page,
        limit,
      },
    });
  }
);

// DELETE /:id — remove subscriber (owner check)
subscribersRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const subscriber = await prisma.subscriber.findUnique({ where: { id } });
  if (!subscriber) {
    throw new AppError(ErrorCode.NOT_FOUND, `Subscriber '${id}' not found`);
  }
  if (subscriber.creatorId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this subscriber");
  }
  await prisma.subscriber.delete({ where: { id } });
  return c.json({ data: { deleted: true } });
});

export { subscribersRoutes };
