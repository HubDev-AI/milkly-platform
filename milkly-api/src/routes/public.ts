import crypto from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/validation.js";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { sendConfirmationEmail } from "../services/email.js";
import { env } from "../env.js";

const publicRoutes = new Hono();

function requireParam(value: string | undefined, name: string): string {
  if (!value) throw new AppError(ErrorCode.VALIDATION_ERROR, `Missing path parameter: ${name}`);
  return value;
}

// GET /newsletters — paginated list of PUBLISHED newsletters
publicRoutes.get(
  "/newsletters",
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
  ),
  async (c) => {
    const { page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;
    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, username: true, name: true, image: true } },
        },
      }),
      prisma.newsletter.count({ where: { status: "PUBLISHED" } }),
    ]);
    return c.json({ data: { newsletters, total, page, limit } });
  }
);

// GET /newsletters/@:username/:slug — single newsletter by creator username + slug
publicRoutes.get("/newsletters/@:username/:slug", async (c) => {
  const username = requireParam(c.req.param("username"), "username");
  const slug = requireParam(c.req.param("slug"), "slug");
  const creator = await prisma.user.findFirst({ where: { username } });
  if (!creator) {
    throw new AppError(ErrorCode.NOT_FOUND, `Creator '@${username}' not found`);
  }
  const newsletter = await prisma.newsletter.findUnique({
    where: { userId_slug: { userId: creator.id, slug } },
    include: {
      user: { select: { id: true, username: true, name: true, image: true } },
    },
  });
  if (!newsletter || newsletter.status !== "PUBLISHED") {
    throw new AppError(ErrorCode.NOT_FOUND, `Newsletter '${slug}' not found`);
  }
  return c.json({ data: newsletter });
});

// GET /creators/@:username — creator profile + their published newsletters
publicRoutes.get("/creators/@:username", async (c) => {
  const username = requireParam(c.req.param("username"), "username");
  const creator = await prisma.user.findFirst({
    where: { username },
    select: { id: true, username: true, name: true, image: true, createdAt: true },
  });
  if (!creator) {
    throw new AppError(ErrorCode.NOT_FOUND, `Creator '@${username}' not found`);
  }
  const newsletters = await prisma.newsletter.findMany({
    where: { userId: creator.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  return c.json({ data: { creator, newsletters } });
});

// POST /subscribe — create pending subscriber, send confirm email
publicRoutes.post(
  "/subscribe",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
      creatorId: z.string(),
    })
  ),
  async (c) => {
    const { email, creatorId } = c.req.valid("json");
    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) {
      throw new AppError(ErrorCode.NOT_FOUND, `Creator '${creatorId}' not found`);
    }
    const existing = await prisma.subscriber.findUnique({
      where: { email_creatorId: { email, creatorId } },
    });
    if (existing) {
      if (existing.confirmed) {
        throw new AppError(ErrorCode.DUPLICATE, "Already subscribed");
      }
      const confirmUrl = `${env.NEWS_URL}/confirm/${existing.confirmToken}`;
      await sendConfirmationEmail(email, confirmUrl);
      return c.json({ data: { id: existing.id, confirmed: existing.confirmed } }, 200);
    }
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        creatorId,
        confirmToken: crypto.randomBytes(32).toString("hex"),
        unsubscribeToken: crypto.randomBytes(32).toString("hex"),
      },
    });
    const confirmUrl = `${env.NEWS_URL}/confirm/${subscriber.confirmToken}`;
    await sendConfirmationEmail(email, confirmUrl);
    return c.json({ data: { id: subscriber.id, confirmed: subscriber.confirmed } }, 201);
  }
);

// GET /confirm/:token — confirm subscription
publicRoutes.get("/confirm/:token", async (c) => {
  const token = requireParam(c.req.param("token"), "token");
  const subscriber = await prisma.subscriber.findUnique({ where: { confirmToken: token } });
  if (!subscriber) {
    throw new AppError(ErrorCode.NOT_FOUND, "Confirmation token not found");
  }
  await prisma.subscriber.update({
    where: { id: subscriber.id },
    data: { confirmed: true },
  });
  return c.json({ data: { confirmed: true } });
});

// GET /unsubscribe/:token — unsubscribe
publicRoutes.get("/unsubscribe/:token", async (c) => {
  const token = requireParam(c.req.param("token"), "token");
  const subscriber = await prisma.subscriber.findUnique({ where: { unsubscribeToken: token } });
  if (!subscriber) {
    throw new AppError(ErrorCode.NOT_FOUND, "Unsubscribe token not found");
  }
  await prisma.subscriber.delete({ where: { id: subscriber.id } });
  return c.json({ data: { unsubscribed: true } });
});

export { publicRoutes };
