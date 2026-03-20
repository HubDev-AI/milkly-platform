import { AppError, ErrorCode } from "milkly-shared/errors";

export function isNotFoundError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCode.NOT_FOUND;
}
