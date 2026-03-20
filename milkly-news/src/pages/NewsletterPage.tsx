import type { CSSProperties } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "isomorphic-dompurify";
import { LoadingSkeleton } from "milkly-shared/components";
import { fetchNewsletter } from "@/lib/api-client";
import { isNotFoundError } from "@/lib/error-utils";
import { formatDate, getInitials } from "@/lib/format-utils";
import { NotFoundPage } from "@/pages/NotFoundPage";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const articleContainerStyle: CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "2rem 1rem 4rem",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  textDecoration: "none",
  fontFamily: "var(--milkly-font-sans)",
  marginBottom: "2rem",
  transition: "color 0.15s ease",
};

const titleStyle: CSSProperties = {
  margin: "0 0 1rem",
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2.5rem",
  fontWeight: 700,
  lineHeight: 1.2,
  color: "var(--milkly-fg-primary)",
};

const authorRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "2rem",
  paddingBottom: "1.5rem",
  borderBottom: "1px solid var(--milkly-border)",
};

const avatarStyle: CSSProperties = {
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const initialsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.5rem",
  height: "2.5rem",
  borderRadius: "50%",
  background: "var(--milkly-brand)",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-sans)",
  flexShrink: 0,
};

const authorInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
};

const authorNameLinkStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  textDecoration: "none",
  fontFamily: "var(--milkly-font-sans)",
};

const publishedDateStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  fontFamily: "var(--milkly-font-sans)",
};

const contentStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "1.0625rem",
  lineHeight: 1.75,
  color: "var(--milkly-fg-primary)",
  wordBreak: "break-word",
};

const errorContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  padding: "4rem 1rem",
  textAlign: "center",
  maxWidth: "720px",
  margin: "0 auto",
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

// Skeleton styles
const skeletonContainerStyle: CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "2rem 1rem 4rem",
};

const skeletonAuthorRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "2rem",
  paddingBottom: "1.5rem",
  borderBottom: "1px solid var(--milkly-border)",
};

const skeletonAuthorInfoStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

const skeletonContentBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function ArticleSkeleton(): JSX.Element {
  return (
    <div style={skeletonContainerStyle} aria-busy="true" aria-live="polite">
      <LoadingSkeleton height="0.875rem" width="5rem" style={{ marginBottom: "2rem" }} />
      <LoadingSkeleton height="2.5rem" width="90%" style={{ marginBottom: "0.5rem" }} />
      <LoadingSkeleton height="2.5rem" width="60%" style={{ marginBottom: "1rem" }} />
      <div style={skeletonAuthorRowStyle}>
        <LoadingSkeleton height="2.5rem" width="2.5rem" borderRadius="50%" />
        <div style={skeletonAuthorInfoStyle}>
          <LoadingSkeleton height="0.9375rem" width="8rem" />
          <LoadingSkeleton height="0.8125rem" width="6rem" />
        </div>
      </div>
      <div style={skeletonContentBlockStyle}>
        <LoadingSkeleton height="1rem" />
        <LoadingSkeleton height="1rem" />
        <LoadingSkeleton height="1rem" width="95%" />
        <LoadingSkeleton height="1rem" width="85%" />
        <LoadingSkeleton height="1rem" />
        <LoadingSkeleton height="1rem" width="70%" />
        <LoadingSkeleton height="1rem" />
        <LoadingSkeleton height="1rem" width="90%" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NewsletterPage(): JSX.Element {
  const { username, slug } = useParams<{ username: string; slug: string }>();

  const {
    data: newsletter,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["newsletter", username, slug],
    queryFn: () => fetchNewsletter(username ?? "", slug ?? ""),
    enabled: username !== undefined && slug !== undefined,
  });

  // Loading state
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  // 404 state
  if (error !== null && !isLoading && isNotFoundError(error)) {
    return <NotFoundPage />;
  }

  // Error state (non-404)
  if (error !== null && !isLoading) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load newsletter.";
    return (
      <div style={errorContainerStyle} role="alert">
        <p style={errorTextStyle}>{errorMessage}</p>
        <button
          type="button"
          onClick={() => {
            void refetch();
          }}
          style={retryButtonStyle}
          aria-label="Retry loading newsletter"
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty / missing params state
  if (!newsletter) {
    return <NotFoundPage />;
  }

  // Success state
  const { user } = newsletter;
  const displayName = user.name ?? user.username ?? "Anonymous";
  const publishedDate =
    newsletter.publishedAt !== null
      ? formatDate(newsletter.publishedAt, { year: "numeric", month: "long", day: "numeric" })
      : formatDate(newsletter.createdAt, { year: "numeric", month: "long", day: "numeric" });
  const sanitizedContent = DOMPurify.sanitize(newsletter.content);

  return (
    <article style={articleContainerStyle}>
      <nav>
        <Link
          to="/"
          style={backLinkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--milkly-brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--milkly-fg-secondary)";
          }}
        >
          &larr; All newsletters
        </Link>
      </nav>

      <h1 style={titleStyle}>{newsletter.title}</h1>

      <div style={authorRowStyle}>
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
        <div style={authorInfoStyle}>
          <Link
            to={`/@${user.username ?? "unknown"}`}
            style={authorNameLinkStyle}
          >
            {displayName}
          </Link>
          <time
            dateTime={newsletter.publishedAt ?? newsletter.createdAt}
            style={publishedDateStyle}
          >
            {publishedDate}
          </time>
        </div>
      </div>

      <div
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
}
