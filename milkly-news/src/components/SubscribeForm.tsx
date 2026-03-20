import { type CSSProperties, type FormEvent, useState } from "react";
import { AppError, ErrorCode } from "milkly-shared/errors";
import { subscribe } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SubscribeFormProps {
  creatorId: string;
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "already-subscribed" }
  | { kind: "error"; message: string };

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const formContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.5rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  maxWidth: "480px",
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const inputRowStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  fontFamily: "var(--milkly-font-sans)",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-primary)",
  color: "var(--milkly-fg-primary)",
  outline: "none",
};

const buttonStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  borderRadius: "var(--milkly-radius-md)",
  border: "none",
  background: "var(--milkly-brand)",
  color: "#fff",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const buttonDisabledStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
};

const messageStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  fontFamily: "var(--milkly-font-sans)",
};

const successMessageStyle: CSSProperties = {
  ...messageStyle,
  color: "hsl(142 71% 45%)",
};

const alreadySubscribedMessageStyle: CSSProperties = {
  ...messageStyle,
  color: "var(--milkly-fg-secondary)",
};

const errorMessageStyle: CSSProperties = {
  ...messageStyle,
  color: "hsl(0 84% 60%)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubscribeForm({ creatorId }: SubscribeFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  const isSubmitting = status.kind === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const trimmed = email.trim();
    if (trimmed.length === 0) return;

    setStatus({ kind: "loading" });

    try {
      await subscribe(trimmed, creatorId);
      setStatus({ kind: "success" });
      setEmail("");
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === ErrorCode.DUPLICATE) {
        setStatus({ kind: "already-subscribed" });
      } else {
        const msg =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setStatus({ kind: "error", message: msg });
      }
    }
  }

  return (
    <div style={formContainerStyle}>
      <h3 style={headingStyle}>Subscribe to this newsletter</h3>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        style={inputRowStyle}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="you@example.com"
          required
          disabled={isSubmitting}
          aria-label="Email address"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={isSubmitting ? buttonDisabledStyle : buttonStyle}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {status.kind === "success" && (
        <p style={successMessageStyle} role="status">
          Check your email to confirm your subscription!
        </p>
      )}

      {status.kind === "already-subscribed" && (
        <p style={alreadySubscribedMessageStyle} role="status">
          You're already subscribed.
        </p>
      )}

      {status.kind === "error" && (
        <p style={errorMessageStyle} role="alert">
          {status.message}
        </p>
      )}
    </div>
  );
}
