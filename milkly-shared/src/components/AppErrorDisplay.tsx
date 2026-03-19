import type { CSSProperties } from "react";
import { AppError } from "../errors/index.js";

export interface AppErrorDisplayProps {
  error: AppError | string;
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export function AppErrorDisplay({
  error,
  onRetry,
  className,
  style,
}: AppErrorDisplayProps): JSX.Element {
  const message = error instanceof AppError ? error.message : error;
  const code = error instanceof AppError ? error.code : undefined;

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "var(--milkly-radius-md)",
    border: "1px solid hsl(0 84% 85%)",
    background: "hsl(0 84% 97%)",
    fontFamily: "var(--milkly-font-sans)",
    color: "hsl(0 84% 60%)",
    ...style,
  };

  const messageStyle: CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.4,
    margin: 0,
  };

  const codeStyle: CSSProperties = {
    fontSize: "0.75rem",
    color: "var(--milkly-fg-secondary)",
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
    margin: 0,
  };

  const retryButtonStyle: CSSProperties = {
    alignSelf: "flex-start",
    marginTop: "0.25rem",
    padding: "0.375rem 0.75rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    borderRadius: "var(--milkly-radius-md)",
    border: "none",
    background: "var(--milkly-brand)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "var(--milkly-font-sans)",
    transition: "background 0.15s ease",
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={className}
      style={containerStyle}
    >
      <p style={messageStyle}>{message}</p>
      {code !== undefined && (
        <p style={codeStyle}>Error code: {code}</p>
      )}
      {onRetry !== undefined && (
        <button
          type="button"
          onClick={onRetry}
          style={retryButtonStyle}
          aria-label="Retry"
        >
          Try again
        </button>
      )}
    </div>
  );
}
