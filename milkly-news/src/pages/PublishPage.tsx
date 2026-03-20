import type { CSSProperties } from "react";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import type { Draft, Newsletter } from "milkly-shared/types";
import { fetchDrafts, fetchMyNewsletters } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { DraftCard } from "@/components/DraftCard";
import { PublishPreview } from "@/components/PublishPreview";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const pageStyle: CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "2rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 2rem",
  borderBottom: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const brandStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "var(--milkly-brand)",
  textDecoration: "none",
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const navLinkStyle: CSSProperties = {
  color: "var(--milkly-fg-secondary)",
  textDecoration: "none",
};

const navLinkActiveStyle: CSSProperties = {
  ...navLinkStyle,
  color: "var(--milkly-brand)",
  fontWeight: 600,
};

const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 1.25rem",
  fontSize: "1.5rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const subHeadingStyle: CSSProperties = {
  margin: "2.5rem 0 1rem",
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.25rem",
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

const successBannerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
  padding: "2rem",
  marginBottom: "2rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "hsl(142 71% 45% / 0.1)",
  border: "1px solid hsl(142 71% 45% / 0.3)",
  textAlign: "center",
};

const successTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "hsl(142 71% 30%)",
  fontFamily: "var(--milkly-font-serif)",
};

const successMessageStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  color: "hsl(142 71% 30%)",
};

const successLinkStyle: CSSProperties = {
  color: "var(--milkly-brand)",
  fontWeight: 600,
  textDecoration: "none",
};

const publishedCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "1.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

const publishedTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const publishedMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
};

const statusBadgeStyle: CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  padding: "0.125rem 0.5rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "hsl(142 71% 45% / 0.15)",
  color: "hsl(142 71% 30%)",
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DraftsSkeleton(): JSX.Element {
  const cards = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div style={gridStyle} aria-busy="true" aria-live="polite">
      {cards.map((i) => (
        <div key={i} style={skeletonCardStyle}>
          <LoadingSkeleton height="1.25rem" width="80%" />
          <LoadingSkeleton height="0.875rem" />
          <LoadingSkeleton height="0.875rem" width="90%" />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem" }}>
            <LoadingSkeleton height="0.75rem" width="6rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Published newsletter entry
// ---------------------------------------------------------------------------

interface PublishedEntryProps {
  newsletter: Newsletter;
  username: string | null;
}

function PublishedEntry({ newsletter, username }: PublishedEntryProps): JSX.Element {
  const href = `/@${username ?? "unknown"}/${newsletter.slug}`;
  const publishedDate = newsletter.publishedAt !== null
    ? new Date(newsletter.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <Link
      to={href}
      style={publishedCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px hsla(20 10% 15% / 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <h4 style={publishedTitleStyle}>{newsletter.title}</h4>
      <div style={publishedMetaStyle}>
        <span style={statusBadgeStyle}>{newsletter.status}</span>
        {publishedDate.length > 0 && (
          <time dateTime={newsletter.publishedAt ?? ""}>{publishedDate}</time>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main page content (rendered inside AuthGuard by App.tsx)
// ---------------------------------------------------------------------------

export function PublishPage(): JSX.Element {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [publishedResult, setPublishedResult] = useState<Newsletter | null>(null);

  const { data: sessionUser } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 30_000,
  });

  const {
    data: drafts,
    isLoading: draftsLoading,
    error: draftsError,
    refetch: refetchDrafts,
  } = useQuery({
    queryKey: ["drafts"],
    queryFn: fetchDrafts,
  });

  const {
    data: newsletters,
    isLoading: newslettersLoading,
    error: newslettersError,
    refetch: refetchNewsletters,
  } = useQuery({
    queryKey: ["my-newsletters"],
    queryFn: fetchMyNewsletters,
  });

  const handleDraftSelect = useCallback((draft: Draft) => {
    setSelectedDraft((prev) => (prev?.id === draft.id ? null : draft));
  }, []);

  const handleCancelPreview = useCallback(() => {
    setSelectedDraft(null);
  }, []);

  const handlePublished = useCallback((newsletter: Newsletter) => {
    setPublishedResult(newsletter);
    setSelectedDraft(null);
    void refetchDrafts();
    void refetchNewsletters();
  }, [refetchDrafts, refetchNewsletters]);

  const handleDismissSuccess = useCallback(() => {
    setPublishedResult(null);
  }, []);

  const currentUsername = sessionUser?.username ?? null;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--milkly-bg-primary)" }}>
      <header style={headerStyle}>
        <Link to="/" style={brandStyle} aria-label="milkly.news home">
          milkly.news
        </Link>
        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/publish" style={navLinkActiveStyle}>Publish</Link>
        </nav>
      </header>

      <div style={pageStyle}>
        {publishedResult !== null && (
          <div style={successBannerStyle} role="status">
            <h3 style={successTitleStyle}>Published successfully!</h3>
            <p style={successMessageStyle}>
              &ldquo;{publishedResult.title}&rdquo; is now live at{" "}
              <Link
                to={`/@${currentUsername ?? "unknown"}/${publishedResult.slug}`}
                style={successLinkStyle}
              >
                /@{currentUsername ?? "unknown"}/{publishedResult.slug}
              </Link>
            </p>
            <button
              type="button"
              style={{ ...retryButtonStyle, background: "hsl(142 71% 45%)" }}
              onClick={handleDismissSuccess}
            >
              Dismiss
            </button>
          </div>
        )}

        <h1 style={sectionHeadingStyle}>Publish a Newsletter</h1>

        {draftsError !== null && !draftsLoading && (
          <div style={errorContainerStyle} role="alert">
            <p style={errorTextStyle}>
              {draftsError instanceof Error ? draftsError.message : "Failed to load drafts."}
            </p>
            <button
              type="button"
              onClick={() => { void refetchDrafts(); }}
              style={retryButtonStyle}
              aria-label="Retry loading drafts"
            >
              Try again
            </button>
          </div>
        )}

        {draftsLoading && <DraftsSkeleton />}

        {!draftsLoading && draftsError === null && (drafts === undefined || drafts.length === 0) && (
          <div style={emptyStateStyle}>
            <h2 style={emptyHeadingStyle}>No drafts available</h2>
            <p style={emptyMessageStyle}>
              Create a draft in the editor first, then come back here to publish it.
            </p>
          </div>
        )}

        {!draftsLoading && draftsError === null && drafts !== undefined && drafts.length > 0 && (
          <div style={gridStyle}>
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                selected={selectedDraft?.id === draft.id}
                onSelect={handleDraftSelect}
              />
            ))}
          </div>
        )}

        {selectedDraft !== null && (
          <PublishPreview
            draft={selectedDraft}
            onCancel={handleCancelPreview}
            onPublished={handlePublished}
          />
        )}

        <h2 style={subHeadingStyle}>My Published Newsletters</h2>

        {newslettersError !== null && !newslettersLoading && (
          <div style={errorContainerStyle} role="alert">
            <p style={errorTextStyle}>
              {newslettersError instanceof Error ? newslettersError.message : "Failed to load newsletters."}
            </p>
            <button
              type="button"
              onClick={() => { void refetchNewsletters(); }}
              style={retryButtonStyle}
              aria-label="Retry loading newsletters"
            >
              Try again
            </button>
          </div>
        )}

        {newslettersLoading && <DraftsSkeleton />}

        {!newslettersLoading && newslettersError === null && (newsletters === undefined || newsletters.length === 0) && (
          <div style={emptyStateStyle}>
            <h2 style={emptyHeadingStyle}>No published newsletters yet</h2>
            <p style={emptyMessageStyle}>
              Select a draft above and publish it to see it here.
            </p>
          </div>
        )}

        {!newslettersLoading && newslettersError === null && newsletters !== undefined && newsletters.length > 0 && (
          <div style={gridStyle}>
            {newsletters.map((newsletter) => (
              <PublishedEntry
                key={newsletter.id}
                newsletter={newsletter}
                username={currentUsername}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
