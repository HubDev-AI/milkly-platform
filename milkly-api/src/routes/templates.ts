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

const templatesRoutes = new Hono<{ Variables: Variables }>();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

// GET / — list public templates + user's own templates
templatesRoutes.get("/", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const userId = session?.user.id;

  const templates = await prisma.template.findMany({
    where: userId
      ? { OR: [{ isPublic: true }, { userId }] }
      : { isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ data: templates });
});

// GET /:id — get template detail
templatesRoutes.get("/:id", async (c) => {
  const id = requireParam(c.req.param("id"), "id");
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) {
    throw new AppError(ErrorCode.NOT_FOUND, `Template '${id}' not found`);
  }
  return c.json({ data: template });
});

// POST / — create template (auth required)
templatesRoutes.post(
  "/",
  requireAuth,
  zValidator(
    "json",
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      mklySource: z.string(),
    })
  ),
  async (c) => {
    const user = c.get("user");
    const { name, description, mklySource } = c.req.valid("json");
    const template = await prisma.template.create({
      data: {
        name,
        mklySource,
        userId: user.id,
        ...(description !== undefined && { description }),
      },
    });
    return c.json({ data: template }, 201);
  }
);

export { templatesRoutes };
