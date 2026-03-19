import type { CSSProperties, ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { GuestRoute } from "@/components/GuestRoute";
import { LoginPage } from "@/pages/LoginPage";
import { VerifyOtpPage } from "@/pages/VerifyOtpPage";
import { SsoCallbackPage } from "@/pages/SsoCallbackPage";

// ---------------------------------------------------------------------------
// Query client (singleton — created outside component to avoid re-creation)
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

const errorPageStyle: CSSProperties = {
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

const errorHeadingStyle: CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  margin: 0,
  color: "var(--milkly-fg-primary)",
};

const errorMessageStyle: CSSProperties = {
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

class AppErrorBoundary extends Component<
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

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Error logged to boundary state; no external service configured yet.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={errorPageStyle} role="alert" aria-live="assertive">
          <h1 style={errorHeadingStyle}>Something went wrong</h1>
          <p style={errorMessageStyle}>{this.state.message}</p>
          <button
            type="button"
            style={reloadButtonStyle}
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Editor placeholder (Task 6 replaces this with the real EditorView)
// ---------------------------------------------------------------------------

const editorPlaceholderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-secondary)",
  fontSize: "0.875rem",
};

function EditorViewPlaceholder(): JSX.Element {
  // TODO: replace with real EditorView when Task 6 is complete
  return (
    <div style={editorPlaceholderStyle} aria-label="Editor">
      Editor loading…
    </div>
  );
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

function App(): JSX.Element {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/verify"
              element={
                <GuestRoute>
                  <VerifyOtpPage />
                </GuestRoute>
              }
            />
            <Route path="/auth/callback" element={<SsoCallbackPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <EditorViewPlaceholder />
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
