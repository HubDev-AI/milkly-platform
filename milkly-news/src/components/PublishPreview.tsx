import type { CSSProperties } from "react";
import { useState, useCallback } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { Draft, Newsletter } from "milkly-shared/types";
import { publishNewsletter } from "@/lib/api-client";
import { AppError } from "milkly-shared/errors";

export interface PublishPreviewProps {
  draft: Draft;
  onCancel: () => void;
  onPublished: (newsletter: Newsletter) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "hsla(20 10% 15% / 0.5)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  zIndex: 100,
  padding: "1rem",
};

const dialogStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "720px",
  maxHeight: "85dvh",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-primary)",
  boxShadow: "var(--milkly-shadow-lg)",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--milkly-border)",
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const contentContainerStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "1.5rem",
};

const previewTitleStyle: CSSProperties = {
  margin: "0 0 1.25rem",
  fontSize: "1.75rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  lineHeight: 1.2,
  color: "var(--milkly-fg-primary)",
};

const previewContentStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "1rem",
  lineHeight: 1.75,
  color: "var(--milkly-fg-primary)",
  wordBreak: "break-word",
};

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "0.75rem",
  padding: "1rem 1.5rem",
  borderTop: "1px solid var(--milkly-border)",
};

const cancelButtonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "transparent",
  color: "var(--milkly-fg-primary)",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
};

const publishButtonStyle: CSSProperties = {
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

const publishButtonDisabledStyle: CSSProperties = {
  ...publishButtonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
};

const errorBannerStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "hsl(0 84% 60% / 0.1)",
  border: "1px solid hsl(0 84% 60% / 0.3)",
  color: "hsl(0 84% 60%)",
  fontSize: "0.875rem",
  fontFamily: "var(--milkly-font-sans)",
  margin: "0 1.5rem",
};

const retryLinkStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: "hsl(0 84% 60%)",
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "inherit",
  padding: 0,
  marginLeft: "0.25rem",
};

const emptyContentWarningStyle: CSSProperties = {
  padding: "1rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "hsl(40 100% 50% / 0.1)",
  border: "1px solid hsl(40 100% 50% / 0.3)",
  color: "hsl(40 60% 35%)",
  fontSize: "0.875rem",
  fontFamily: "var(--milkly-font-sans)",
  textAlign: "center",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PublishPreview({
  draft,
  onCancel,
  onPublished,
}: PublishPreviewProps): JSX.Element {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = draft.title ?? "Untitled Draft";
  const sanitizedContent = DOMPurify.sanitize(draft.mklySource);
  const plainText = DOMPurify.sanitize(draft.mklySource, { ALLOWED_TAGS: [] }).trim();
  const hasContent = plainText.length > 0;

  const handlePublish = useCallback(async () => {
    if (!hasContent) return;

    setIsPublishing(true);
    setError(null);

    try {
      const newsletter = await publishNewsletter(draft.id);
      onPublished(newsletter);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsPublishing(false);
    }
  }, [draft.id, hasContent, onPublished]);

  const handleRetry = useCallback(() => {
    void handlePublish();
  }, [handlePublish]);

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Publish preview"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onCancel();
        }
      }}
    >
      <div style={dialogStyle}>
        <div style={headerStyle}>
          <h2 style={headerTitleStyle}>Preview &amp; Publish</h2>
        </div>

        {error !== null && (
          <div style={errorBannerStyle} role="alert">
            {error}
            <button type="button" style={retryLinkStyle} onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        <div style={contentContainerStyle}>
          <h3 style={previewTitleStyle}>{title}</h3>

          {!hasContent ? (
            <div style={emptyContentWarningStyle}>
              This draft has no content. Add content before publishing.
            </div>
          ) : (
            <div
              style={previewContentStyle}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          )}
        </div>

        <div style={footerStyle}>
          <button
            type="button"
            style={cancelButtonStyle}
            onClick={onCancel}
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button
            type="button"
            style={hasContent && !isPublishing ? publishButtonStyle : publishButtonDisabledStyle}
            onClick={() => { void handlePublish(); }}
            disabled={!hasContent || isPublishing}
            aria-disabled={!hasContent || isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
