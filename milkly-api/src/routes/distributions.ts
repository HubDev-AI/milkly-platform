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

const distributionsRoutes = new Hono<{ Variables: Variables }>();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

// POST / — queue distribution
distributionsRoutes.post(
  "/",
  requireAuth,
  zValidator("json", z.object({ newsletterId: z.string() })),
  async (c) => {
    const user = c.get("user");
    const { newsletterId } = c.req.valid("json");

    const newsletter = await prisma.newsletter.findUnique({ where: { id: newsletterId } });
    if (!newsletter) {
      throw new AppError(ErrorCode.NOT_FOUND, `Newsletter '${newsletterId}' not found`);
    }
    if (newsletter.userId !== user.id) {
      throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this newsletter");
    }
    if (newsletter.status !== "PUBLISHED") {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Only PUBLISHED newsletters can be distributed"
      );
    }

    const distribution = await prisma.distribution.create({
      data: { newsletterId, status: "PENDING" },
    });

    // TODO: enqueue BullMQ job in Story 4-2
    console.log(`Distribution queued: ${distribution.id}`);

    return c.json({ data: { id: distribution.id, status: distribution.status } }, 201);
  }
);

// GET / — distribution history for user (paginated)
distributionsRoutes.get(
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

    const [distributions, total] = await Promise.all([
      prisma.distribution.findMany({
        where: { newsletter: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          newsletter: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.distribution.count({ where: { newsletter: { userId: user.id } } }),
    ]);

    return c.json({ data: { distributions, total, page, limit } });
  }
);

// GET /:id — distribution status
distributionsRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const distribution = await prisma.distribution.findUnique({
    where: { id },
    include: { newsletter: { select: { id: true, title: true, userId: true } } },
  });
  if (!distribution) {
    throw new AppError(ErrorCode.NOT_FOUND, `Distribution '${id}' not found`);
  }
  if (distribution.newsletter.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this distribution");
  }
  return c.json({ data: distribution });
});

export { distributionsRoutes };
