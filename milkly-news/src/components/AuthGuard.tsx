import type { CSSProperties, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import { PORTALS } from "milkly-shared/constants";
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

export function AuthGuard({ children }: AuthGuardProps): JSX.Element {
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
    const appLoginUrl = `${PORTALS.app.url}/login?returnTo=${encodeURIComponent(window.location.href)}`;
    window.location.href = appLoginUrl;
    return (
      <div style={loadingContainerStyle} aria-label="Redirecting to login...">
        <LoadingSkeleton width="200px" height="1.25rem" />
        <LoadingSkeleton width="320px" height="1rem" />
      </div>
    );
  }

  return <>{children}</>;
}
