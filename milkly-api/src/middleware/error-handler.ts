import type { Context, Next } from "hono";
import { AppError } from "milkly-shared/errors";

export async function errorHandler(c: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json(
        {
          error: {
            code: err.code,
            message: err.message,
            ...(err.field !== undefined && { field: err.field }),
            ...(err.details !== undefined && { details: err.details }),
          },
        },
        err.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502
      );
    }

    console.error("[Unhandled error]", err);
    return c.json(
      { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      500
    );
  }
}
