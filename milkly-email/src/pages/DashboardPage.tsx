import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Users, Send, History, Inbox } from "lucide-react";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchSubscribers } from "@/lib/api-client";
import { fetchDistributions } from "@/lib/api-client";

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

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "1rem",
  marginBottom: "2rem",
};

const glassCardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  backdropFilter: "blur(16px) saturate(1.4)",
  WebkitBackdropFilter: "blur(16px) saturate(1.4)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "var(--milkly-radius-lg)",
  padding: "1.25rem 1.5rem",
};

const statLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 0.375rem",
};

const statValueStyle: CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  margin: 0,
  lineHeight: 1.2,
};

const sectionHeadingStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 1rem",
};

const quickActionsStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  flexWrap: "wrap",
  marginBottom: "2rem",
};

const actionLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.125rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-brand)",
  color: "#fff",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
};

const secondaryLinkStyle: CSSProperties = {
  ...actionLinkStyle,
  background: "rgba(0, 0, 0, 0.05)",
  color: "var(--milkly-fg-primary)",
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

const emptySubTextStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  opacity: 0.7,
  margin: 0,
  maxWidth: 400,
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

function StatusBadge({ status }: { status: string }): JSX.Element {
  const colors = STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS["PENDING"];
  return (
    <span style={{ ...baseBadgeStyle, ...colors }}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardPage(): JSX.Element {
  const {
    data: subsData,
    isLoading: subsLoading,
    error: subsError,
  } = useQuery({
    queryKey: ["subscribers", 1, 1],
    queryFn: () => fetchSubscribers(1, 1),
    staleTime: 30_000,
  });

  const {
    data: distData,
    isLoading: distLoading,
    error: distError,
  } = useQuery({
    queryKey: ["distributions", 1, 5],
    queryFn: () => fetchDistributions(1, 5),
    staleTime: 30_000,
  });

  const hasSubscribers = subsData !== undefined && subsData.counts.total > 0;
  const hasDistributions = distData !== undefined && distData.distributions.length > 0;

  return (
    <div>
      <h1 style={headingStyle}>Dashboard</h1>

      {/* Stats */}
      <div style={statsGridStyle}>
        <div style={glassCardStyle}>
          <p style={statLabelStyle}>Total Subscribers</p>
          {subsLoading ? (
            <LoadingSkeleton width="60px" height="1.75rem" />
          ) : subsError ? (
            <p style={{ ...statValueStyle, fontSize: "0.875rem", color: "var(--milkly-fg-secondary)" }}>--</p>
          ) : (
            <p style={statValueStyle}>{subsData?.counts.total ?? 0}</p>
          )}
        </div>
        <div style={glassCardStyle}>
          <p style={statLabelStyle}>Confirmed</p>
          {subsLoading ? (
            <LoadingSkeleton width="60px" height="1.75rem" />
          ) : subsError ? (
            <p style={{ ...statValueStyle, fontSize: "0.875rem", color: "var(--milkly-fg-secondary)" }}>--</p>
          ) : (
            <p style={statValueStyle}>{subsData?.counts.confirmed ?? 0}</p>
          )}
        </div>
        <div style={glassCardStyle}>
          <p style={statLabelStyle}>Unconfirmed</p>
          {subsLoading ? (
            <LoadingSkeleton width="60px" height="1.75rem" />
          ) : subsError ? (
            <p style={{ ...statValueStyle, fontSize: "0.875rem", color: "var(--milkly-fg-secondary)" }}>--</p>
          ) : (
            <p style={statValueStyle}>{subsData?.counts.unconfirmed ?? 0}</p>
          )}
        </div>
        <div style={glassCardStyle}>
          <p style={statLabelStyle}>Distributions</p>
          {distLoading ? (
            <LoadingSkeleton width="60px" height="1.75rem" />
          ) : distError ? (
            <p style={{ ...statValueStyle, fontSize: "0.875rem", color: "var(--milkly-fg-secondary)" }}>--</p>
          ) : (
            <p style={statValueStyle}>{distData?.total ?? 0}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={sectionHeadingStyle}>Quick Actions</h2>
      <div style={quickActionsStyle}>
        <Link to="/subscribers" style={secondaryLinkStyle}>
          <Users size={16} aria-hidden="true" />
          View Subscribers
        </Link>
        <Link to="/send" style={actionLinkStyle}>
          <Send size={16} aria-hidden="true" />
          Send Newsletter
        </Link>
        <Link to="/history" style={secondaryLinkStyle}>
          <History size={16} aria-hidden="true" />
          Distribution History
        </Link>
      </div>

      {/* Empty state */}
      {!subsLoading && !hasSubscribers ? (
        <div style={{ ...glassCardStyle, ...emptyStateStyle }}>
          <Inbox size={48} style={emptyIconStyle} aria-hidden="true" />
          <p style={emptyTextStyle}>You have no subscribers yet.</p>
          <p style={emptySubTextStyle}>
            Readers can subscribe to your newsletters from your public profile on milkly.news.
          </p>
        </div>
      ) : null}

      {/* Recent distributions */}
      {hasDistributions ? (
        <>
          <h2 style={{ ...sectionHeadingStyle, marginTop: "1.5rem" }}>Recent Distributions</h2>
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Newsletter</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Sent</th>
                  <th style={thStyle}>Failed</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {distData.distributions.map((d) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
