import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchNewsletters } from "@/lib/api-client";
import { NewsletterCard } from "@/components/NewsletterCard";
import { Pagination } from "@/components/Pagination";

const PAGE_LIMIT = 20;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const heroStyle: CSSProperties = {
  textAlign: "center",
  padding: "2.5rem 0 2rem",
};

const heroHeadingStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2.5rem",
  fontWeight: 700,
  color: "var(--milkly-brand)",
  lineHeight: 1.15,
};

const heroTaglineStyle: CSSProperties = {
  margin: "0.5rem 0 0",
  fontSize: "1.125rem",
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
  fontWeight: 400,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.25rem",
};

const skeletonGridStyle: CSSProperties = {
  ...gridStyle,
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

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function BrowseSkeleton(): JSX.Element {
  const cards = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div style={skeletonGridStyle} aria-busy="true" aria-live="polite">
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
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BrowsePage(): JSX.Element {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["newsletters", "browse", page],
    queryFn: () => fetchNewsletters(page, PAGE_LIMIT),
  });

  const newsletters = data?.newsletters ?? [];
  const totalPages = data !== undefined ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  // Error state
  if (error !== null && !isLoading) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load newsletters.";
    return (
      <>
        <section style={heroStyle}>
          <h1 style={heroHeadingStyle}>milkly.news</h1>
          <p style={heroTaglineStyle}>Discover newsletters from creators you love</p>
        </section>
        <div style={errorContainerStyle} role="alert">
          <p style={errorTextStyle}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            style={retryButtonStyle}
            aria-label="Retry loading newsletters"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <section style={heroStyle}>
        <h1 style={heroHeadingStyle}>milkly.news</h1>
        <p style={heroTaglineStyle}>Discover newsletters from creators you love</p>
      </section>

      {isLoading && <BrowseSkeleton />}

      {!isLoading && newsletters.length === 0 && (
        <div style={emptyStateStyle}>
          <h2 style={emptyHeadingStyle}>No newsletters published yet</h2>
          <p style={emptyMessageStyle}>
            Check back soon — creators are working on something great.
          </p>
        </div>
      )}

      {!isLoading && newsletters.length > 0 && (
        <>
          <div style={gridStyle}>
            {newsletters.map((newsletter) => (
              <NewsletterCard key={newsletter.id} newsletter={newsletter} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
