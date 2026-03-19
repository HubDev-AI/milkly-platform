import type { AuthClient } from "milkly-shared/auth";
import type { User } from "milkly-shared/types";
import type { PortalId } from "milkly-shared/types";
const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

function extractUser(data: unknown): User {
  if (
    typeof data !== "object" ||
    data === null ||
    !("user" in data) ||
    typeof (data as Record<string, unknown>)["user"] !== "object" ||
    (data as Record<string, unknown>)["user"] === null
  ) {
    throw new Error("Invalid session response: missing user");
  }

  const raw = (data as Record<string, unknown>)["user"] as Record<string, unknown>;

  if (typeof raw["id"] !== "string" || raw["id"] === "") {
    throw new Error("Invalid session: missing user id");
  }
  if (typeof raw["email"] !== "string" || raw["email"] === "") {
    throw new Error("Invalid session: missing user email");
  }

  return {
    id: raw["id"],
    email: raw["email"],
    name: typeof raw["name"] === "string" ? raw["name"] : null,
    username: typeof raw["username"] === "string" ? raw["username"] : null,
    image: typeof raw["image"] === "string" ? raw["image"] : null,
    createdAt: typeof raw["createdAt"] === "string" ? raw["createdAt"] : new Date().toISOString(),
    updatedAt: typeof raw["updatedAt"] === "string" ? raw["updatedAt"] : new Date().toISOString(),
  };
}

const authClientInstance: AuthClient = {
  async sendOtp(email: string): Promise<void> {
    const response = await authFetch("/auth/email-otp/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as Record<string, unknown>)["error"] === "object" &&
        (body as Record<string, unknown>)["error"] !== null &&
        "message" in ((body as Record<string, unknown>)["error"] as object)
          ? String(
              ((body as Record<string, unknown>)["error"] as Record<string, unknown>)["message"]
            )
          : `Failed to send OTP (HTTP ${response.status})`;
      throw new Error(message);
    }
  },

  async verifyOtp(email: string, otp: string): Promise<User> {
    const response = await authFetch("/auth/email-otp/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => ({}));
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as Record<string, unknown>)["error"] === "object" &&
        (body as Record<string, unknown>)["error"] !== null &&
        "message" in ((body as Record<string, unknown>)["error"] as Record<string, unknown>)
          ? String(
              ((body as Record<string, unknown>)["error"] as Record<string, unknown>)["message"]
            )
          : `OTP verification failed (HTTP ${response.status})`;
      throw new Error(message);
    }

    const body: unknown = await response.json();
    return extractUser(body);
  },

  async getSession(): Promise<User | null> {
    const response = await authFetch("/auth/session");

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json().catch(() => null);

    if (
      body === null ||
      typeof body !== "object" ||
      !("user" in body) ||
      (body as Record<string, unknown>)["user"] === null
    ) {
      return null;
    }

    return extractUser(body);
  },

  async logout(): Promise<void> {
    await authFetch("/auth/sign-out", { method: "POST" });
  },

  async logoutAll(): Promise<void> {
    await authFetch("/auth/logout-all", { method: "POST" });
  },

  async ssoRedirect(targetPortal: PortalId, returnPath?: string): Promise<void> {
    const body: Record<string, unknown> = { targetPortal };
    if (returnPath !== undefined) {
      body["returnPath"] = returnPath;
    }

    const response = await authFetch("/auth/sso/token", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`SSO redirect failed (HTTP ${response.status})`);
    }

    const responseBody: unknown = await response.json();

    if (
      typeof responseBody !== "object" ||
      responseBody === null ||
      !("data" in responseBody) ||
      typeof (responseBody as Record<string, unknown>)["data"] !== "object" ||
      (responseBody as Record<string, unknown>)["data"] === null ||
      !("redirectUrl" in ((responseBody as Record<string, unknown>)["data"] as object)) ||
      typeof (
        ((responseBody as Record<string, unknown>)["data"] as Record<string, unknown>)["redirectUrl"]
      ) !== "string"
    ) {
      throw new Error("SSO redirect response missing redirectUrl");
    }

    const redirectUrl = (
      ((responseBody as Record<string, unknown>)["data"] as Record<string, unknown>)[
        "redirectUrl"
      ] as string
    );

    window.location.href = redirectUrl;
  },
};

export const authClient = authClientInstance;
