import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { NewsletterWithUser } from "@/lib/api-client";

export interface NewsletterCardProps {
  newsletter: NewsletterWithUser;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags and take the first N characters as a plain-text preview. */
function contentPreview(html: string, maxLength: number): string {
  // Remove HTML tags to get plain text
  const text = html.replace(/<[^>]*>/g, "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/** Format a date string as a locale-friendly short date. */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Get initials from a display name (up to 2 chars). */
function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return `${(parts[0]?.[0] ?? "").toUpperCase()}${(parts[parts.length - 1]?.[0] ?? "").toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  boxShadow: "var(--milkly-shadow-lg)",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  cursor: "pointer",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
  lineHeight: 1.3,
};

const previewStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  lineHeight: 1.55,
  color: "var(--milkly-fg-secondary)",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "auto",
  paddingTop: "0.5rem",
};

const avatarStyle: CSSProperties = {
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const initialsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "50%",
  background: "var(--milkly-brand)",
  color: "#fff",
  fontSize: "0.6875rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-sans)",
  flexShrink: 0,
};

const creatorNameStyle: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
};

const dateStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
  marginLeft: "auto",
};

const HOVER_KEYFRAMES = `
@keyframes milkly-card-hover {}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewsletterCard({ newsletter }: NewsletterCardProps): JSX.Element {
  const { user } = newsletter;
  const href = `/@${user.username ?? "unknown"}/${newsletter.slug}`;
  const displayName = user.name ?? user.username ?? "Anonymous";
  const preview = contentPreview(newsletter.content, 150);
  const publishedDate = newsletter.publishedAt !== null
    ? formatDate(newsletter.publishedAt)
    : formatDate(newsletter.createdAt);

  return (
    <>
      <style>{HOVER_KEYFRAMES}</style>
      <Link
        to={href}
        style={cardStyle}
        aria-label={`Read "${newsletter.title}" by ${displayName}`}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 24px hsla(20 10% 15% / 0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "";
          el.style.boxShadow = "var(--milkly-shadow-lg)";
        }}
      >
        <h3 style={titleStyle}>{newsletter.title}</h3>
        {preview.length > 0 && <p style={previewStyle}>{preview}</p>}
        <div style={metaRowStyle}>
          {user.image ? (
            <img
              src={user.image}
              alt={`${displayName}'s avatar`}
              style={avatarStyle}
            />
          ) : (
            <span style={initialsStyle} aria-hidden="true">
              {getInitials(displayName)}
            </span>
          )}
          <span style={creatorNameStyle}>{displayName}</span>
          <time dateTime={newsletter.publishedAt ?? newsletter.createdAt} style={dateStyle}>
            {publishedDate}
          </time>
        </div>
      </Link>
    </>
  );
}
