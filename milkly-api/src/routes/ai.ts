import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/validation.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { callAI, cleanMarkdownBlocks, isAIConfigured } from "../services/ai.js";
import { auth } from "../auth.js";

type Variables = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

const aiRoutes = new Hono<{ Variables: Variables }>();

aiRoutes.post(
  "/generate-newsletter",
  requireAuth,
  zValidator(
    "json",
    z.object({
      prompt: z.string().min(1).max(10_000),
    }),
  ),
  async (c) => {
    if (!isAIConfigured("high")) {
      throw new AppError(
        ErrorCode.AI_GENERATION_FAILED,
        "AI service is not configured. Set AI_PROVIDER and AI_MODEL in your environment.",
      );
    }

    const { prompt } = c.req.valid("json");

    try {
      const raw = await callAI(prompt, { modelTier: "high" });
      const mklySource = cleanMarkdownBlocks(raw);

      // Basic validation: must contain at least one block separator
      if (!mklySource.includes("---")) {
        return c.json({
          data: { mklySource },
          warning: "validation_incomplete",
        });
      }

      return c.json({ data: { mklySource } });
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        ErrorCode.AI_GENERATION_FAILED,
        error instanceof Error ? error.message : "AI generation failed",
        { cause: error },
      );
    }
  },
);

export { aiRoutes };
