import crypto from "node:crypto";
import { prisma } from "../prisma.js";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { env } from "../env.js";

const PORTAL_ORIGIN_MAP: Record<string, string> = {
  app: env.APP_URL,
  news: env.NEWS_URL,
  email: env.EMAIL_URL,
  ai: env.AI_URL,
  landing: env.LANDING_URL,
};

export async function generateSsoToken(
  userId: string,
  targetPortal: string
): Promise<{ redirectUrl: string }> {
  const portalOrigin = PORTAL_ORIGIN_MAP[targetPortal];
  if (!portalOrigin) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, `Unknown portal: ${targetPortal}`, {
      field: "targetPortal",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.ssoToken.create({
    data: { token, nonce, userId, targetPortal, expiresAt },
  });

  const redirectUrl = `${portalOrigin}/auth/callback?token=${token}&nonce=${nonce}`;
  return { redirectUrl };
}

export async function exchangeSsoToken(
  token: string,
  nonce: string,
  requestOrigin: string
): Promise<string> {
  // Read the token first for validation (expiry, nonce, origin checks)
  const ssoToken = await prisma.ssoToken.findUnique({ where: { token } });

  if (!ssoToken) {
    throw new AppError(ErrorCode.SSO_TOKEN_EXPIRED, "SSO token not found or already expired");
  }
  if (ssoToken.expiresAt < new Date()) {
    throw new AppError(ErrorCode.SSO_TOKEN_EXPIRED, "SSO token has expired");
  }
  if (ssoToken.nonce !== nonce) {
    throw new AppError(ErrorCode.SSO_PORTAL_MISMATCH, "SSO nonce mismatch");
  }

  // Strict origin equality — startsWith would allow milkly.news.evil.com to bypass
  const expectedOrigin = PORTAL_ORIGIN_MAP[ssoToken.targetPortal];
  if (!expectedOrigin || requestOrigin !== expectedOrigin) {
    throw new AppError(
      ErrorCode.SSO_PORTAL_MISMATCH,
      "Request origin does not match target portal"
    );
  }

  // Atomic mark-as-used: only succeeds if usedAt is still null (prevents TOCTOU race)
  const { count } = await prisma.ssoToken.updateMany({
    where: { token, usedAt: null },
    data: { usedAt: new Date() },
  });

  if (count === 0) {
    throw new AppError(ErrorCode.SSO_TOKEN_USED, "SSO token has already been used");
  }

  return ssoToken.userId;
}

export async function cleanupExpiredSsoTokens(): Promise<void> {
  await prisma.ssoToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
