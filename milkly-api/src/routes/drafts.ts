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

const draftsRoutes = new Hono<{ Variables: Variables }>();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "untitled";
}

// GET / — list user's non-deleted drafts, sorted by updatedAt desc
draftsRoutes.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const drafts = await prisma.draft.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  return c.json({ data: drafts });
});

// POST / — create draft
draftsRoutes.post(
  "/",
  requireAuth,
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      mklySource: z.string(),
      templateId: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { title, mklySource, templateId } = c.req.valid("json");
    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        mklySource,
        ...(title !== undefined && { title }),
        ...(templateId !== undefined && { templateId }),
      },
    });
    return c.json({ data: draft }, 201);
  }
);

// GET /:id — get single draft (owner check, not deleted)
draftsRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const draft = await prisma.draft.findUnique({ where: { id } });
  if (!draft || draft.deletedAt !== null) {
    throw new AppError(ErrorCode.NOT_FOUND, `Draft '${id}' not found`);
  }
  if (draft.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this draft");
  }
  return c.json({ data: draft });
});

// PUT /:id — update draft (owner check)
draftsRoutes.put(
  "/:id",
  requireAuth,
  zValidator(
    "json",
    z.object({
      title: z.string().optional(),
      mklySource: z.string().optional(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const id = requireParam(c.req.param("id"), "id");
    const draft = await prisma.draft.findUnique({ where: { id } });
    if (!draft || draft.deletedAt !== null) {
      throw new AppError(ErrorCode.NOT_FOUND, `Draft '${id}' not found`);
    }
    if (draft.userId !== user.id) {
      throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this draft");
    }
    const { title, mklySource } = c.req.valid("json");
    const updated = await prisma.draft.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(mklySource !== undefined && { mklySource }),
      },
    });
    return c.json({ data: updated });
  }
);

// POST /:id/publish — convert draft to published newsletter
draftsRoutes.post("/:id/publish", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const draft = await prisma.draft.findUnique({ where: { id } });
  if (!draft || draft.deletedAt !== null) {
    throw new AppError(ErrorCode.NOT_FOUND, `Draft '${id}' not found`);
  }
  if (draft.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this draft");
  }
  if (!draft.mklySource.trim()) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Draft has no content");
  }

  const title = draft.title || "Untitled";
  const baseSlug = generateSlug(title);

  const MAX_SLUG_ATTEMPTS = 100;
  let slug = baseSlug;
  let attempt = 1;
  while (attempt <= MAX_SLUG_ATTEMPTS) {
    const conflict = await prisma.newsletter.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (!conflict) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
  if (attempt > MAX_SLUG_ATTEMPTS) {
    throw new AppError(ErrorCode.INTERNAL_ERROR, "Unable to generate unique slug");
  }

  const newsletter = await prisma.newsletter.create({
    data: {
      title,
      content: draft.mklySource,
      mklySource: draft.mklySource,
      slug,
      status: "PUBLISHED",
      publishedAt: new Date(),
      userId: draft.userId,
      ...(draft.templateId !== null && { templateId: draft.templateId }),
    },
  });

  return c.json({ data: newsletter });
});

// DELETE /:id — soft delete (set deletedAt = now)
draftsRoutes.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const id = requireParam(c.req.param("id"), "id");
  const draft = await prisma.draft.findUnique({ where: { id } });
  if (!draft || draft.deletedAt !== null) {
    throw new AppError(ErrorCode.NOT_FOUND, `Draft '${id}' not found`);
  }
  if (draft.userId !== user.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not have access to this draft");
  }
  const deleted = await prisma.draft.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return c.json({ data: deleted });
});

export { draftsRoutes };
