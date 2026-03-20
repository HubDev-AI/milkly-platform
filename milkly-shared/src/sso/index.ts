import type { PortalId } from "../types/index.js";
import { PORTALS } from "../constants/index.js";

/**
 * Build the SSO callback URL for a target portal.
 * Used by the API when generating SSO tokens.
 */
export function buildSsoCallbackUrl(
  targetPortal: PortalId,
  token: string,
  nonce: string
): string {
  const portalUrl = PORTALS[targetPortal].url;
  const params = new URLSearchParams({ token, nonce });
  return `${portalUrl}/auth/callback?${params.toString()}`;
}

/**
 * Parse SSO callback query params.
 * Used by portal /auth/callback pages.
 */
export function parseSsoCallback(
  searchParams: URLSearchParams
): { token: string; nonce: string; returnPath?: string } | { error: string } {
  const error = searchParams.get("error");
  if (error) {
    return { error };
  }

  const token = searchParams.get("token");
  const nonce = searchParams.get("nonce");

  if (!token || !nonce) {
    return { error: "missing_params" };
  }

  const returnPath = searchParams.get("returnPath");
  if (returnPath) {
    return { token, nonce, returnPath };
  }

  return { token, nonce };
}

/**
 * Map portal origin URL to PortalId.
 * Used by the API to validate SSO token targetPortal against requesting origin.
 */
export function originToPortalId(origin: string): PortalId | null {
  for (const [id, config] of Object.entries(PORTALS)) {
    const portalOrigin = new URL(config.url).origin;
    if (portalOrigin === origin) {
      return id as PortalId;
    }
  }
  return null;
}
