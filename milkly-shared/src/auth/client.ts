import type { User } from "../types/index.js";
import type { PortalId } from "../types/index.js";

export interface AuthClient {
  /** Login with email OTP — sends OTP to email */
  sendOtp(email: string): Promise<void>;

  /** Verify OTP and create session */
  verifyOtp(email: string, otp: string): Promise<User>;

  /** Get current session user (null if not authenticated) */
  getSession(): Promise<User | null>;

  /** Logout current portal session */
  logout(): Promise<void>;

  /** Logout all sessions across all portals */
  logoutAll(): Promise<void>;

  /** Initiate SSO redirect to target portal */
  ssoRedirect(targetPortal: PortalId, returnPath?: string): Promise<void>;
}

/**
 * Create an auth client bound to a specific portal origin.
 *
 * @deprecated createAuthClient is not implemented in milkly-shared.
 * Each portal must create its own auth client wrapping better-auth.
 * See milkly-app/src/lib/auth-client.ts for an example.
 *
 * @throws {Error} Always throws — this is an unimplemented stub.
 */
export function createAuthClient(_portalOrigin: string): AuthClient {
  throw new Error(
    "createAuthClient is not implemented in milkly-shared. Each portal must create its own auth client wrapping better-auth. See milkly-app/src/lib/auth-client.ts for an example."
  );
}
