import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { auth } from "../auth.js";

type Variables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

const newslettersRoutes = new Hono<{ Variables: Variables }>();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// GET / — list user's newsletters
newslettersRoutes.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const newsletters = await prisma.newsletter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return c.json({ data: newsletters });
});

// GET /:id — get detail (owner check)
newslettersRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const newsletter = await prisma.newsletter.findUnique({ where: { id } });
  if (!newsletter) {
    throw new AppError(ErrorCode.NOT_FOUND, `Newsletter '${id}' not found`);
  }
  if (newsletter.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this newsletter");
  }
  return c.json({ data: newsletter });
});

// POST /:id/publish — publish with slug generation
newslettersRoutes.post("/:id/publish", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const newsletter = await prisma.newsletter.findUnique({ where: { id } });
  if (!newsletter) {
    throw new AppError(ErrorCode.NOT_FOUND, `Newsletter '${id}' not found`);
  }
  if (newsletter.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this newsletter");
  }

  const baseSlug = generateSlug(newsletter.title);

  // Resolve slug conflicts for same user
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const conflict = await prisma.newsletter.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (!conflict || conflict.id === id) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const published = await prisma.newsletter.update({
    where: { id },
    data: { slug, publishedAt: new Date(), status: "PUBLISHED" },
  });

  return c.json({ data: published });
});

// DELETE /:id — archive
newslettersRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const newsletter = await prisma.newsletter.findUnique({ where: { id } });
  if (!newsletter) {
    throw new AppError(ErrorCode.NOT_FOUND, `Newsletter '${id}' not found`);
  }
  if (newsletter.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this newsletter");
  }
  const archived = await prisma.newsletter.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  return c.json({ data: archived });
});

export { newslettersRoutes };
