import type { CSSProperties, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import { authClient } from "@/lib/auth-client";

export interface AuthGuardProps {
  children: ReactNode;
}

const loadingContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  gap: "1rem",
  padding: "2rem",
  background: "var(--milkly-bg-primary)",
};

const messageStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
  margin: 0,
  textAlign: "center",
};

const linkStyle: CSSProperties = {
  color: "var(--milkly-brand)",
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: "var(--milkly-font-sans)",
};

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const appUrl = import.meta.env.VITE_APP_URL ?? "https://milkly.app";
  const { data: user, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    retry: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div style={loadingContainerStyle} aria-label="Checking authentication...">
        <LoadingSkeleton width="200px" height="1.25rem" />
        <LoadingSkeleton width="320px" height="1rem" />
        <LoadingSkeleton width="280px" height="1rem" />
      </div>
    );
  }

  if (user === null || user === undefined) {
    return (
      <div style={loadingContainerStyle}>
        <p style={messageStyle}>
          Please sign in to use Milkly Email.
        </p>
        <a href={appUrl} style={linkStyle}>
          Go to Milkly Editor to sign in
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
