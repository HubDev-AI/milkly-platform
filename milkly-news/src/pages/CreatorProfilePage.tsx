import type { CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchCreatorProfile } from "@/lib/api-client";
import type { NewsletterWithUser } from "@/lib/api-client";
import { isNotFoundError } from "@/lib/error-utils";
import { formatDate, getInitials } from "@/lib/format-utils";
import { NewsletterCard } from "@/components/NewsletterCard";
import { NotFoundPage } from "@/pages/NotFoundPage";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const profileHeaderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
  padding: "2.5rem 0 2rem",
  textAlign: "center",
};

const avatarLargeStyle: CSSProperties = {
  width: "5rem",
  height: "5rem",
  borderRadius: "50%",
  objectFit: "cover",
};

const initialsLargeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "5rem",
  height: "5rem",
  borderRadius: "50%",
  background: "var(--milkly-brand)",
  color: "#fff",
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-sans)",
};

const displayNameStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  lineHeight: 1.2,
};

const usernameStyle: CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
};

const memberSinceStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
};

const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 1rem",
  fontSize: "1.25rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.25rem",
};

const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  padding: "4rem 1rem",
  textAlign: "center",
};

const emptyHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  fontFamily: "var(--milkly-font-serif)",
};

const emptyMessageStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  color: "var(--milkly-fg-secondary)",
};

const errorContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  padding: "4rem 1rem",
  textAlign: "center",
};

const errorTextStyle: CSSProperties = {
  fontSize: "0.9375rem",
  color: "hsl(0 84% 60%)",
  fontFamily: "var(--milkly-font-sans)",
};

const retryButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  border: "none",
  background: "var(--milkly-brand)",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
};

const skeletonHeaderStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
  padding: "2.5rem 0 2rem",
};

const skeletonCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
};

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function ProfileSkeleton(): JSX.Element {
  const cards = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div aria-busy="true" aria-live="polite">
      <div style={skeletonHeaderStyle}>
        <LoadingSkeleton height="5rem" width="5rem" borderRadius="50%" />
        <LoadingSkeleton height="2rem" width="10rem" />
        <LoadingSkeleton height="1rem" width="6rem" />
        <LoadingSkeleton height="0.875rem" width="9rem" />
      </div>
      <LoadingSkeleton height="1.25rem" width="12rem" style={{ marginBottom: "1rem" }} />
      <div style={gridStyle}>
        {cards.map((i) => (
          <div key={i} style={skeletonCardStyle}>
            <LoadingSkeleton height="1.25rem" width="80%" />
            <LoadingSkeleton height="0.875rem" />
            <LoadingSkeleton height="0.875rem" width="90%" />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem" }}>
              <LoadingSkeleton height="1.75rem" width="1.75rem" borderRadius="50%" />
              <LoadingSkeleton height="0.8rem" width="5rem" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreatorProfilePage(): JSX.Element {
  const { username } = useParams<{ username: string }>();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["creator", username],
    queryFn: () => fetchCreatorProfile(username ?? ""),
    enabled: username !== undefined && username.length > 0,
  });

  // Loading state
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // 404 — creator not found
  if (error !== null && isNotFoundError(error)) {
    return <NotFoundPage />;
  }

  // Generic error state
  if (error !== null) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load creator profile.";
    return (
      <div style={errorContainerStyle} role="alert">
        <p style={errorTextStyle}>{errorMessage}</p>
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          style={retryButtonStyle}
          aria-label="Retry loading creator profile"
        >
          Try again
        </button>
      </div>
    );
  }

  // No data (query disabled due to missing username)
  if (!data) {
    return <NotFoundPage />;
  }

  const { creator, newsletters } = data;
  const displayName = creator.name ?? creator.username ?? "Anonymous";

  // Map newsletters to include creator as user for NewsletterCard compatibility
  const newslettersWithUser: NewsletterWithUser[] = newsletters.map((newsletter) => ({
    ...newsletter,
    user: {
      id: creator.id,
      username: creator.username,
      name: creator.name,
      image: creator.image,
    },
  }));

  return (
    <>
      <header style={profileHeaderStyle}>
        {creator.image ? (
          <img
            src={creator.image}
            alt={`${displayName}'s avatar`}
            style={avatarLargeStyle}
          />
        ) : (
          <span style={initialsLargeStyle} aria-hidden="true">
            {getInitials(displayName)}
          </span>
        )}
        <h1 style={displayNameStyle}>{displayName}</h1>
        <p style={usernameStyle}>@{creator.username}</p>
        <p style={memberSinceStyle}>
          Member since {formatDate(creator.createdAt, { year: "numeric", month: "long" })}
        </p>
      </header>

      {newslettersWithUser.length === 0 && (
        <div style={emptyStateStyle}>
          <h2 style={emptyHeadingStyle}>No newsletters published yet</h2>
          <p style={emptyMessageStyle}>
            Check back soon — this creator is working on something great.
          </p>
        </div>
      )}

      {newslettersWithUser.length > 0 && (
        <>
          <h2 style={sectionHeadingStyle}>Published newsletters</h2>
          <div style={gridStyle}>
            {newslettersWithUser.map((newsletter) => (
              <NewsletterCard key={newsletter.id} newsletter={newsletter} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
