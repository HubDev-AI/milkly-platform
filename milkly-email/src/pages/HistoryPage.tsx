import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, ChevronLeft, ChevronRight, ExternalLink, Clock } from "lucide-react";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchDistributions, fetchDistribution } from "@/lib/api-client";

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

const STATUS_BADGE_COLORS: Record<string, CSSProperties> = {
  PENDING: { background: "rgba(107, 114, 128, 0.12)", color: "#6b7280" },
  PROCESSING: { background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" },
  COMPLETED: { background: "rgba(34, 197, 94, 0.12)", color: "#16a34a" },
  FAILED: { background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" },
};

const baseBadgeStyle: CSSProperties = {
  display: "inline-block",
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
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
  maxWidth: 400,
};

const detailBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "var(--milkly-radius-sm)",
  border: "none",
  background: "rgba(0, 0, 0, 0.04)",
  cursor: "pointer",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
};

const detailPanelStyle: CSSProperties = {
  ...glassCardStyle,
  padding: "1.25rem 1.5rem",
  marginTop: "1rem",
};

const detailLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 0.25rem",
};

const detailValueStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-fg-primary)",
  margin: "0 0 1rem",
};

const errorTextStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#ef4444",
  padding: "1rem",
};

function StatusBadge({ status }: { status: string }): JSX.Element {
  const colors = STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS["PENDING"];
  return (
    <span style={{ ...baseBadgeStyle, ...colors }}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function DistributionDetail({ distributionId, onClose }: { distributionId: string; onClose: () => void }): JSX.Element {
  const isInProgress = (status: string): boolean =>
    status === "PENDING" || status === "PROCESSING";

  const { data, isLoading, error } = useQuery({
    queryKey: ["distribution-detail", distributionId],
    queryFn: () => fetchDistribution(distributionId),
    staleTime: 5_000,
    refetchInterval: (query) => {
      const dist = query.state.data;
      if (dist && isInProgress(dist.status)) {
        return 3_000;
      }
      return false;
    },
  });

  if (isLoading) {
    return (
      <div style={detailPanelStyle}>
        <LoadingSkeleton width="40%" height="1rem" />
        <div style={{ marginTop: "0.5rem" }}>
          <LoadingSkeleton width="60%" height="0.875rem" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...detailPanelStyle, ...errorTextStyle }}>
        Failed to load distribution details.
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ ...detailPanelStyle, ...errorTextStyle }}>
        Distribution not found.
      </div>
    );
  }

  return (
    <div style={detailPanelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--milkly-fg-primary)" }}>
          Distribution Details
        </h3>
        <button type="button" style={detailBtnStyle} onClick={onClose}>
          Close
        </button>
      </div>

      <p style={detailLabelStyle}>Newsletter</p>
      <p style={detailValueStyle}>{data.newsletter.title}</p>

      <p style={detailLabelStyle}>Status</p>
      <p style={detailValueStyle}><StatusBadge status={data.status} /></p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <p style={detailLabelStyle}>Total Sent</p>
          <p style={detailValueStyle}>{data.totalSent}</p>
        </div>
        <div>
          <p style={detailLabelStyle}>Total Failed</p>
          <p style={detailValueStyle}>{data.totalFailed}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <p style={detailLabelStyle}>Started</p>
          <p style={detailValueStyle}>
            {data.startedAt ? new Date(data.startedAt).toLocaleString() : "Not started"}
          </p>
        </div>
        <div>
          <p style={detailLabelStyle}>Completed</p>
          <p style={detailValueStyle}>
            {data.completedAt ? new Date(data.completedAt).toLocaleString() : "In progress"}
          </p>
        </div>
      </div>

      {data.errorLog ? (
        <>
          <p style={detailLabelStyle}>Error Log</p>
          <p style={{ ...detailValueStyle, whiteSpace: "pre-wrap", fontSize: "0.75rem", fontFamily: "monospace" }}>
            {data.errorLog}
          </p>
        </>
      ) : null}

      {isInProgress(data.status) ? (
        <p style={{ fontSize: "0.75rem", color: "var(--milkly-fg-secondary)", display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.5rem" }}>
          <Clock size={12} aria-hidden="true" />
          Auto-refreshing while in progress...
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

export function HistoryPage(): JSX.Element {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["distributions", page, PAGE_SIZE],
    queryFn: () => fetchDistributions(page, PAGE_SIZE),
    staleTime: 15_000,
    refetchInterval: 10_000,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const hasDistributions = data !== undefined && data.distributions.length > 0;

  return (
    <div>
      <h1 style={headingStyle}>Distribution History</h1>

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
          Failed to load distributions: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : null}

      {/* Empty */}
      {!isLoading && !error && !hasDistributions ? (
        <div style={{ ...glassCardStyle, ...emptyStateStyle }}>
          <History size={48} style={emptyIconStyle} aria-hidden="true" />
          <p style={emptyTextStyle}>No distributions yet.</p>
          <p style={{ ...emptyTextStyle, fontSize: "0.8125rem", opacity: 0.7 }}>
            When you send newsletters to your subscribers, distribution records will appear here.
          </p>
        </div>
      ) : null}

      {/* Table */}
      {!isLoading && !error && hasDistributions ? (
        <>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Newsletter</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Sent</th>
                  <th style={thStyle}>Failed</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.distributions.map((d) => (
                  <tr key={d.id}>
                    <td style={tdStyle}>{d.newsletter.title}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={d.status} />
                    </td>
                    <td style={tdStyle}>{d.totalSent}</td>
                    <td style={tdStyle}>{d.totalFailed}</td>
                    <td style={tdStyle}>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        style={detailBtnStyle}
                        onClick={() => {
                          setSelectedId(
                            selectedId === d.id ? null : d.id
                          );
                        }}
                      >
                        <ExternalLink size={12} aria-hidden="true" />
                        {selectedId === d.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedId ? (
            <DistributionDetail
              distributionId={selectedId}
              onClose={() => { setSelectedId(null); }}
            />
          ) : null}

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
