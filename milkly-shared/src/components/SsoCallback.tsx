import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { User, ApiErrorResponse } from "../types/index.js";
import type { AppError } from "../errors/index.js";
import { ErrorCode } from "../errors/index.js";
import { parseApiError } from "../api/client.js";
import { parseSsoCallback } from "../sso/index.js";
import { getApiBaseUrl } from "../constants/index.js";
import { AppErrorDisplay } from "./AppErrorDisplay.js";
import { LoadingSkeleton } from "./LoadingSkeleton.js";

export interface SsoCallbackProps {
  searchParams: URLSearchParams;
  apiBaseUrl?: string | undefined;
  onSuccess?: ((user: User) => void) | undefined;
  onError?: ((error: AppError) => void) | undefined;
}

type ExchangeState =
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string; error: AppError | undefined };

function getSsoErrorMessage(error: AppError): string {
  switch (error.code) {
    case ErrorCode.SSO_TOKEN_EXPIRED:
      return "Your login link has expired. Please try again from the other portal.";
    case ErrorCode.SSO_TOKEN_USED:
      return "This login link has already been used. Please try again.";
    case ErrorCode.SSO_PORTAL_MISMATCH:
      return "Invalid login attempt. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function SsoCallback({
  searchParams,
  apiBaseUrl,
  onSuccess,
  onError,
}: SsoCallbackProps): JSX.Element {
  const [state, setState] = useState<ExchangeState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function runExchange(): Promise<void> {
      const parsed = parseSsoCallback(searchParams);

      if ("error" in parsed) {
        const message =
          parsed.error === "missing_params"
            ? "Invalid login link. Please try again."
            : "Something went wrong. Please try again.";
        if (!cancelled) {
          setState({ status: "error", message, error: undefined });
        }
        return;
      }

      const { token, nonce } = parsed;
      const baseUrl = apiBaseUrl ?? getApiBaseUrl();

      let response: Response;
      try {
        response = await fetch(`${baseUrl}/auth/sso/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, nonce }),
        });
      } catch (_networkErr) {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Unable to connect. Please check your internet connection.",
            error: undefined,
          });
        }
        return;
      }

      if (!response.ok) {
        let appError: AppError | undefined;
        let message = "Something went wrong. Please try again.";
        try {
          const body = (await response.json()) as ApiErrorResponse;
          appError = parseApiError(body);
          message = getSsoErrorMessage(appError);
        } catch (_parseErr) {
          // keep defaults
        }
        if (!cancelled) {
          setState({ status: "error", message, error: appError });
          if (appError !== undefined && onError !== undefined) {
            onError(appError);
          }
        }
        return;
      }

      let user: User | undefined;
      try {
        const body = (await response.json()) as { data?: { user?: User } };
        user = body.data?.user;
      } catch (_parseErr) {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Something went wrong. Please try again.",
            error: undefined,
          });
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Something went wrong. Please try again.",
            error: undefined,
          });
        }
        return;
      }

      if (!cancelled) {
        setState({ status: "success" });
        if (onSuccess !== undefined) {
          onSuccess(user);
        } else if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }
    }

    void runExchange();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot SSO exchange on mount; re-running on callback ref changes is incorrect
  }, []);

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gap: "1rem",
    padding: "2rem",
    fontFamily: "var(--milkly-font-sans)",
    color: "var(--milkly-fg-primary)",
  };

  const labelStyle: CSSProperties = {
    fontSize: "0.9375rem",
    color: "var(--milkly-fg-secondary)",
    margin: 0,
  };

  if (state.status === "loading") {
    return (
      <div style={containerStyle} role="status" aria-live="polite">
        <LoadingSkeleton width="160px" height="1rem" />
        <p style={labelStyle}>Signing you in…</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div style={containerStyle} role="status" aria-live="polite">
        <p style={labelStyle}>Login successful. Redirecting…</p>
      </div>
    );
  }

  // error state
  return (
    <div style={containerStyle}>
      <AppErrorDisplay
        error={state.error !== undefined ? state.error : state.message}
        onRetry={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </div>
  );
}
