import type { CSSProperties } from "react";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, ArrowLeft, CheckCircle, FileText, AlertCircle } from "lucide-react";
import { LoadingSkeleton } from "milkly-shared/components";
import type { Newsletter } from "milkly-shared/types";
import {
  fetchMyNewsletters,
  fetchNewsletter,
  createDistribution,
} from "@/lib/api-client";

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
  padding: "1.5rem",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  textDecoration: "none",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--milkly-fg-secondary)",
  marginBottom: "1rem",
  fontFamily: "var(--milkly-font-sans)",
};

const newsletterListStyle: CSSProperties = {
  display: "grid",
  gap: "0.75rem",
};

const newsletterCardStyle: CSSProperties = {
  ...glassCardStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textDecoration: "none",
  color: "var(--milkly-fg-primary)",
  transition: "background 150ms ease",
};

const newsletterTitleStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 600,
  margin: 0,
};

const newsletterDateStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
  marginTop: "0.25rem",
};

const sendBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "none",
  background: "var(--milkly-brand)",
  color: "#fff",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
};

const sendBtnDisabled: CSSProperties = {
  ...sendBtnStyle,
  opacity: 0.5,
  cursor: "not-allowed",
};

const successCardStyle: CSSProperties = {
  ...glassCardStyle,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "0.75rem",
  padding: "2.5rem 2rem",
};

const successIconStyle: CSSProperties = {
  color: "#16a34a",
};

const successTextStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  margin: 0,
};

const successSubTextStyle: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  margin: 0,
};

const linkBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.5rem 1rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "rgba(0, 0, 0, 0.05)",
  color: "var(--milkly-fg-primary)",
  textDecoration: "none",
  fontSize: "0.8125rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
};

const emptyStyle: CSSProperties = {
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

const errorTextStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "#ef4444",
};

const previewHeading: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 0.5rem",
};

const previewMeta: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 1.25rem",
};

const previewContent: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-fg-primary)",
  lineHeight: 1.6,
  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
  paddingTop: "1rem",
  marginBottom: "1.5rem",
  whiteSpace: "pre-wrap",
  maxHeight: 300,
  overflowY: "auto",
};

// ---------------------------------------------------------------------------
// Newsletter List (selection)
// ---------------------------------------------------------------------------

function NewsletterList(): JSX.Element {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-newsletters"],
    queryFn: fetchMyNewsletters,
    staleTime: 30_000,
  });

  const publishedNewsletters = data?.filter(
    (n: Newsletter) => n.status === "PUBLISHED"
  );

  if (isLoading) {
    return (
      <div style={glassCardStyle}>
        <LoadingSkeleton width="100%" height="1rem" />
        <div style={{ marginTop: "0.75rem" }}>
          <LoadingSkeleton width="80%" height="1rem" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...glassCardStyle, ...errorTextStyle }}>
        <AlertCircle size={16} aria-hidden="true" style={{ marginRight: "0.375rem", verticalAlign: "middle" }} />
        Failed to load newsletters: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!publishedNewsletters || publishedNewsletters.length === 0) {
    return (
      <div style={{ ...glassCardStyle, ...emptyStyle }}>
        <FileText size={48} style={emptyIconStyle} aria-hidden="true" />
        <p style={emptyTextStyle}>No published newsletters available.</p>
        <p style={{ ...emptyTextStyle, fontSize: "0.8125rem", opacity: 0.7 }}>
          Publish a newsletter in the Milkly Editor first, then return here to send it.
        </p>
      </div>
    );
  }

  return (
    <div style={newsletterListStyle}>
      {publishedNewsletters.map((nl) => (
        <Link
          key={nl.id}
          to={`/send/${nl.id}`}
          style={newsletterCardStyle}
        >
          <div>
            <p style={newsletterTitleStyle}>{nl.title}</p>
            <p style={newsletterDateStyle}>
              Published {nl.publishedAt ? new Date(nl.publishedAt).toLocaleDateString() : ""}
            </p>
          </div>
          <Send size={18} style={{ color: "var(--milkly-fg-secondary)" }} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Send confirmation view (after selecting a newsletter)
// ---------------------------------------------------------------------------

function SendConfirmation({ newsletterId }: { newsletterId: string }): JSX.Element {
  const [distributionId, setDistributionId] = useState<string | null>(null);

  const { data: newsletter, isLoading, error } = useQuery({
    queryKey: ["newsletter", newsletterId],
    queryFn: () => fetchNewsletter(newsletterId),
    staleTime: 30_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => createDistribution(newsletterId),
    onSuccess: (result) => {
      setDistributionId(result.id);
    },
  });

  if (isLoading) {
    return (
      <div style={glassCardStyle}>
        <LoadingSkeleton width="60%" height="1.25rem" />
        <div style={{ marginTop: "0.5rem" }}>
          <LoadingSkeleton width="40%" height="0.875rem" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...glassCardStyle, ...errorTextStyle }}>
        Failed to load newsletter: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div style={{ ...glassCardStyle, ...errorTextStyle }}>
        Newsletter not found.
      </div>
    );
  }

  // Success state
  if (distributionId) {
    return (
      <div style={successCardStyle}>
        <CheckCircle size={40} style={successIconStyle} aria-hidden="true" />
        <p style={successTextStyle}>Distribution Queued</p>
        <p style={successSubTextStyle}>
          Your newsletter &ldquo;{newsletter.title}&rdquo; is being sent to subscribers.
        </p>
        <p style={{ ...successSubTextStyle, fontFamily: "monospace", fontSize: "0.75rem" }}>
          Distribution ID: {distributionId}
        </p>
        <Link to="/history" style={linkBtnStyle}>
          View Distribution Status
        </Link>
      </div>
    );
  }

  return (
    <div style={glassCardStyle}>
      <p style={previewHeading}>{newsletter.title}</p>
      <p style={previewMeta}>
        Status: {newsletter.status}
        {newsletter.publishedAt ? ` | Published: ${new Date(newsletter.publishedAt).toLocaleDateString()}` : ""}
      </p>
      <div style={previewContent}>
        {newsletter.content.length > 500
          ? `${newsletter.content.slice(0, 500)}...`
          : newsletter.content}
      </div>

      {sendMutation.error ? (
        <p style={{ ...errorTextStyle, marginBottom: "0.75rem" }}>
          <AlertCircle size={14} aria-hidden="true" style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
          {sendMutation.error instanceof Error ? sendMutation.error.message : "Failed to queue distribution"}
        </p>
      ) : null}

      <button
        type="button"
        style={sendMutation.isPending ? sendBtnDisabled : sendBtnStyle}
        disabled={sendMutation.isPending}
        onClick={() => { sendMutation.mutate(); }}
      >
        <Send size={16} aria-hidden="true" />
        {sendMutation.isPending ? "Queuing..." : "Send to Subscribers"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function SendPage(): JSX.Element {
  const { newsletterId } = useParams<{ newsletterId: string }>();

  if (newsletterId) {
    return (
      <div>
        <Link to="/send" style={backLinkStyle}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to newsletters
        </Link>
        <h1 style={headingStyle}>Send Newsletter</h1>
        <SendConfirmation newsletterId={newsletterId} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={headingStyle}>Select Newsletter to Send</h1>
      <NewsletterList />
    </div>
  );
}
