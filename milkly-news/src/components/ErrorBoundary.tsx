import type { CSSProperties, ErrorInfo, ReactNode } from "react";
import { Component } from "react";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  gap: "1rem",
  padding: "2rem",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  textAlign: "center",
};

const headingStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  margin: 0,
  color: "var(--milkly-fg-primary)",
};

const messageStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  margin: 0,
  maxWidth: "480px",
};

const reloadButtonStyle: CSSProperties = {
  marginTop: "0.5rem",
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

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={containerStyle} role="alert" aria-live="assertive">
          <h1 style={headingStyle}>Something went wrong</h1>
          <p style={messageStyle}>{this.state.message}</p>
          {typeof window !== "undefined" && (
            <button
              type="button"
              style={reloadButtonStyle}
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload page
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
