import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import { confirmSubscription } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  padding: "4rem 1rem",
  textAlign: "center",
  maxWidth: "520px",
  margin: "0 auto",
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  lineHeight: 1.2,
};

const messageStyle: CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.6,
};

const errorMessageStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "hsl(0 84% 60%)",
};

const linkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.9375rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-brand)",
  textDecoration: "none",
};

const skeletonContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  padding: "4rem 1rem",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConfirmPage(): JSX.Element {
  const { token } = useParams<{ token: string }>();

  const { isLoading, error } = useQuery({
    queryKey: ["confirm-subscription", token],
    queryFn: () => confirmSubscription(token ?? ""),
    enabled: token !== undefined && token.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div style={skeletonContainerStyle} aria-busy="true" aria-live="polite">
        <LoadingSkeleton height="2rem" width="14rem" />
        <LoadingSkeleton height="1rem" width="20rem" />
      </div>
    );
  }

  if (error !== null && error !== undefined) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to confirm subscription.";
    return (
      <div style={containerStyle} role="alert">
        <h1 style={headingStyle}>Confirmation failed</h1>
        <p style={errorMessageStyle}>{errorMessage}</p>
        <Link to="/" style={linkStyle}>
          Browse newsletters
        </Link>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Subscription confirmed!</h1>
      <p style={messageStyle}>
        You're all set. You'll receive new issues directly in your inbox.
      </p>
      <Link to="/" style={linkStyle}>
        Browse newsletters
      </Link>
    </div>
  );
}
