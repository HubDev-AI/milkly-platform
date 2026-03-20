import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";

export interface LoginFormProps {
  onSendOtp: (email: string) => Promise<void>;
  onSuccess: () => void;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SPIN_KEYFRAMES = `
@keyframes milkly-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// Client-side only dedup — always inject during SSR (idempotent in HTML)
let spinInjectedClient = false;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function LoginForm({ onSendOtp, onSuccess, className, style }: LoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const cardStyle: CSSProperties = {
    background: "var(--milkly-bg-glass)",
    backdropFilter: "blur(var(--milkly-glass-blur))",
    WebkitBackdropFilter: "blur(var(--milkly-glass-blur))",
    border: "var(--milkly-glass-border)",
    borderRadius: "var(--milkly-radius-lg)",
    boxShadow: "var(--milkly-shadow-lg)",
    padding: "2rem",
    width: "100%",
    maxWidth: "400px",
    fontFamily: "var(--milkly-font-sans)",
    color: "var(--milkly-fg-primary)",
    ...style,
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--milkly-fg-primary)",
    marginBottom: "0.375rem",
  };

  const inputStyle: CSSProperties = {
    display: "block",
    width: "100%",
    height: "2.5rem",
    padding: "0 0.75rem",
    fontSize: "0.875rem",
    borderRadius: "var(--milkly-radius-md)",
    border: `1px solid var(--milkly-border)`,
    background: "var(--milkly-bg-primary)",
    color: "var(--milkly-fg-primary)",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--milkly-font-sans)",
  };

  const buttonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    height: "2.5rem",
    marginTop: "1rem",
    padding: "0 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    borderRadius: "var(--milkly-radius-md)",
    border: "none",
    background: isLoading ? "var(--milkly-brand-dark)" : "var(--milkly-brand)",
    color: "#fff",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontFamily: "var(--milkly-font-sans)",
    transition: "background 0.15s ease",
  };

  const errorStyle: CSSProperties = {
    marginTop: "0.5rem",
    fontSize: "0.8125rem",
    color: "hsl(0 84% 60%)",
  };

  const headingStyle: CSSProperties = {
    margin: "0 0 1.5rem",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--milkly-fg-primary)",
    letterSpacing: "-0.01em",
  };

  const isServer = typeof window === "undefined";
  const shouldInjectSpin = isServer || !spinInjectedClient;
  if (!isServer && !spinInjectedClient) {
    spinInjectedClient = true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);

    const trimmed = email.trim();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await onSendOtp(trimmed);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={`liquid-glass-card${className !== undefined ? ` ${className}` : ""}`} style={cardStyle}>
      {shouldInjectSpin && <style>{SPIN_KEYFRAMES}</style>}
      <h2 style={headingStyle}>Sign in to Milkly</h2>
      <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
        <div>
          <label htmlFor="login-email" style={labelStyle}>
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={error !== undefined ? "login-email-error" : undefined}
            aria-invalid={error !== undefined ? true : undefined}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={inputStyle}
          />
          {error !== undefined && (
            <p id="login-email-error" role="alert" aria-live="polite" style={errorStyle}>
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          aria-disabled={isLoading}
          aria-label={isLoading ? "Sending code…" : "Send code"}
          style={buttonStyle}
        >
          {isLoading ? (
            <>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: "1rem",
                  height: "1rem",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "milkly-spin 0.7s linear infinite",
                }}
              />
              Sending…
            </>
          ) : (
            "Send Code"
          )}
        </button>
      </form>
    </div>
  );
}
