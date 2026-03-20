import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchSubscribers } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const headingStyle: CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 1.5rem",
  fontFamily: "var(--milkly-font-sans)",
};

const glassCardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(16px) saturate(1.4)",
  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "var(--milkly-radius-lg)",
};

const statsRowStyle: CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
};

const statChipStyle: CSSProperties = {
  ...glassCardStyle,
  padding: "0.625rem 1rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--milkly-fg-secondary)",
};

const statChipValueStyle: CSSProperties = {
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  marginLeft: "0.375rem",
};

const tableContainerStyle: CSSProperties = {
  ...glassCardStyle,
  padding: 0,
  overflow: "hidden",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.875rem",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.75rem 1rem",
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--milkly-fg-secondary)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
};

const tdStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
  color: "var(--milkly-fg-primary)",
};

const confirmedBadge: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  background: "rgba(34, 197, 94, 0.12)",
  color: "#16a34a",
};

const unconfirmedBadge: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  background: "rgba(107, 114, 128, 0.12)",
  color: "#6b7280",
};

const paginationStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  marginTop: "1.25rem",
};

const pageBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.5rem 0.875rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.6)",
  cursor: "pointer",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--milkly-fg-primary)",
  fontFamily: "var(--milkly-font-sans)",
};

const pageBtnDisabled: CSSProperties = {
  ...pageBtnStyle,
  opacity: 0.4,
  cursor: "default",
};

const pageInfoStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  fontWeight: 500,
};

const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "3rem 2rem",
  textAlign: "center",
};

const emptyIconStyle: CSSProperties = {
  color: "var(--milkly-fg-secondary)",
  opacity: 0.5,
  marginBottom: "1rem",
};

const emptyTextStyle: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 0.25rem",
  maxWidth: 420,
};

const emptySubTextStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  opacity: 0.7,
  margin: 0,
  maxWidth: 420,
};

const errorTextStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#ef4444",
  padding: "1rem",
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubscribersPage(): JSX.Element {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["subscribers", page, PAGE_SIZE],
    queryFn: () => fetchSubscribers(page, PAGE_SIZE),
    staleTime: 15_000,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.counts.total / PAGE_SIZE)) : 1;
  const hasSubscribers = data !== undefined && data.counts.total > 0;

  return (
    <div>
      <h1 style={headingStyle}>Subscribers</h1>

      {/* Count chips */}
      {data ? (
        <div style={statsRowStyle}>
          <div style={statChipStyle}>
            Total<span style={statChipValueStyle}>{data.counts.total}</span>
          </div>
          <div style={statChipStyle}>
            Confirmed<span style={statChipValueStyle}>{data.counts.confirmed}</span>
          </div>
          <div style={statChipStyle}>
            Unconfirmed<span style={statChipValueStyle}>{data.counts.unconfirmed}</span>
          </div>
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <div style={{ ...glassCardStyle, padding: "1.5rem" }}>
          <LoadingSkeleton width="100%" height="1rem" />
          <div style={{ marginTop: "0.75rem" }}>
            <LoadingSkeleton width="100%" height="1rem" />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <LoadingSkeleton width="80%" height="1rem" />
          </div>
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div style={{ ...glassCardStyle, ...errorTextStyle }}>
          Failed to load subscribers: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading && !error && !hasSubscribers ? (
        <div style={{ ...glassCardStyle, ...emptyStateStyle }}>
          <Users size={48} style={emptyIconStyle} aria-hidden="true" />
          <p style={emptyTextStyle}>No subscribers yet.</p>
          <p style={emptySubTextStyle}>
            When readers subscribe to your newsletters on milkly.news, they will appear here.
            Share your public profile to start building your audience.
          </p>
        </div>
      ) : null}

      {/* Table */}
      {!isLoading && !error && hasSubscribers ? (
        <>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {data.subscribers.map((sub) => (
                  <tr key={sub.id}>
                    <td style={tdStyle}>{sub.email}</td>
                    <td style={tdStyle}>
                      <span style={sub.confirmed ? confirmedBadge : unconfirmedBadge}>
                        {sub.confirmed ? "Confirmed" : "Unconfirmed"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={paginationStyle}>
            <button
              type="button"
              style={page <= 1 ? pageBtnDisabled : pageBtnStyle}
              disabled={page <= 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); }}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Prev
            </button>
            <span style={pageInfoStyle}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              style={page >= totalPages ? pageBtnDisabled : pageBtnStyle}
              disabled={page >= totalPages}
              onClick={() => { setPage((p) => p + 1); }}
              aria-label="Next page"
            >
              Next
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
