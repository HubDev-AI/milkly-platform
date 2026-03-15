import { Hono } from "hono";
import { AppError, ErrorCode } from "milkly-shared/errors";

const aiRoutes = new Hono();

aiRoutes.post("/generate-newsletter", (_c) => {
  throw new AppError(ErrorCode.INTERNAL_ERROR, "AI generation not yet implemented");
});

export { aiRoutes };
