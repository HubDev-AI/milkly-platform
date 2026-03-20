import type { CSSProperties, FormEvent } from "react";
import { useState, useCallback } from "react";
import { Sparkles, Send, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { AppErrorDisplay } from "milkly-shared/components";
import { generateNewsletter, createDraft } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerationResult {
  mklySource: string;
  title: string;
  warning?: string | undefined;
}

type PageState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "success"; result: GenerationResult }
  | { status: "error"; message: string }
  | { status: "sending" };

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const pageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100dvh",
  padding: "3rem 1.5rem",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "2.5rem",
};

const titleStyle: CSSProperties = {
  fontSize: "2rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  fontFamily: "var(--milkly-font-serif)",
  margin: "0 0 0.5rem",
  lineHeight: 1.2,
};

const subtitleStyle: CSSProperties = {
  fontSize: "1rem",
  color: "var(--milkly-fg-secondary)",
  margin: 0,
  maxWidth: "480px",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "640px",
  background: "var(--milkly-glass-bg)",
  backdropFilter: `blur(var(--milkly-glass-blur))`,
  WebkitBackdropFilter: `blur(var(--milkly-glass-blur))`,
  border: "var(--milkly-glass-border)",
  borderRadius: "var(--milkly-radius-xl)",
  padding: "2rem",
  boxShadow: "var(--milkly-shadow-lg)",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  marginBottom: "0.5rem",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "120px",
  padding: "0.75rem 1rem",
  fontSize: "0.9375rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  background: "var(--milkly-bg-primary)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-md)",
  resize: "vertical",
  outline: "none",
  transition: "border-color 0.15s ease",
  boxSizing: "border-box",
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  color: "#fff",
  background: "var(--milkly-brand)",
  border: "none",
  borderRadius: "var(--milkly-radius-md)",
  cursor: "pointer",
  transition: "background 0.15s ease, opacity 0.15s ease",
};

const secondaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  background: "var(--milkly-bg-secondary)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-md)",
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const disabledButtonStyle: CSSProperties = {
  opacity: 0.6,
  cursor: "not-allowed",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "1rem",
  flexWrap: "wrap",
};

const loadingContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  padding: "2rem 0",
};

const spinnerStyle: CSSProperties = {
  color: "var(--milkly-brand)",
  animation: "spin 1s linear infinite",
};

const loadingTextStyle: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--milkly-fg-secondary)",
  margin: 0,
};

const resultSectionStyle: CSSProperties = {
  marginTop: "2rem",
  width: "100%",
  maxWidth: "640px",
};

const resultCardStyle: CSSProperties = {
  background: "var(--milkly-bg-primary)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-lg)",
  padding: "1.5rem",
  boxShadow: "var(--milkly-shadow-sm)",
};

const resultTitleStyle: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 0.75rem",
};

const previewStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: "0.8125rem",
  fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  color: "var(--milkly-fg-secondary)",
  background: "var(--milkly-bg-secondary)",
  padding: "1rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border-subtle)",
  maxHeight: "320px",
  overflowY: "auto",
  margin: 0,
};

const warningStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  padding: "0.75rem 1rem",
  marginTop: "1rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid hsl(40 80% 75%)",
  background: "hsl(40 80% 96%)",
  fontSize: "0.8125rem",
  color: "hsl(30 80% 30%)",
  lineHeight: 1.5,
};

const warningIconStyle: CSSProperties = {
  flexShrink: 0,
  marginTop: "1px",
  color: "hsl(40 80% 45%)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GeneratePage(): JSX.Element {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<PageState>({ status: "idle" });

  const canSubmit =
    prompt.trim().length > 0 &&
    state.status !== "generating" &&
    state.status !== "sending";

  const handleGenerate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = prompt.trim();
      if (trimmed.length === 0) return;

      setState({ status: "generating" });

      try {
        const result = await generateNewsletter(trimmed);
        setState({ status: "success", result });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during generation.";
        setState({ status: "error", message });
      }
    },
    [prompt]
  );

  const handleSendToEditor = useCallback(async () => {
    if (state.status !== "success") return;
    const { result } = state;

    setState({ status: "sending" });

    try {
      const draft = await createDraft(result.mklySource, result.title);
      await authClient.ssoRedirect("app", `/?draftId=${draft.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create draft. Please try again.";
      setState({ status: "error", message });
    }
  }, [state]);

  const handleRegenerate = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return (
    <main style={pageStyle}>
      {/* Inline keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={headerStyle}>
        <h1 style={titleStyle}>Milkly AI</h1>
        <p style={subtitleStyle}>
          Generate professional newsletter content from a simple prompt.
          Describe your topic and let AI craft the first draft.
        </p>
      </header>

      <div style={cardStyle}>
        <form onSubmit={(e) => void handleGenerate(e)}>
          <label htmlFor="ai-prompt" style={labelStyle}>
            What should your newsletter be about?
          </label>
          <textarea
            id="ai-prompt"
            style={textareaStyle}
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); }}
            placeholder="e.g., A weekly roundup of the latest trends in sustainable fashion, aimed at eco-conscious consumers..."
            disabled={state.status === "generating" || state.status === "sending"}
            aria-describedby="prompt-hint"
          />
          <p
            id="prompt-hint"
            style={{
              fontSize: "0.75rem",
              color: "var(--milkly-fg-tertiary)",
              margin: "0.375rem 0 0",
            }}
          >
            Be specific about the topic, tone, and audience for best results.
          </p>

          <div style={buttonRowStyle}>
            <button
              type="submit"
              style={{
                ...primaryButtonStyle,
                ...(!canSubmit ? disabledButtonStyle : {}),
              }}
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
            >
              <Sparkles size={16} aria-hidden="true" />
              Generate
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {state.status === "generating" && (
        <div style={{ ...resultSectionStyle, ...loadingContainerStyle }} role="status" aria-live="polite">
          <Loader2 size={32} style={spinnerStyle} aria-hidden="true" />
          <p style={loadingTextStyle}>
            Generating your newsletter... This may take up to 30 seconds.
          </p>
        </div>
      )}

      {/* Sending state */}
      {state.status === "sending" && (
        <div style={{ ...resultSectionStyle, ...loadingContainerStyle }} role="status" aria-live="polite">
          <Loader2 size={32} style={spinnerStyle} aria-hidden="true" />
          <p style={loadingTextStyle}>
            Creating draft and redirecting to editor...
          </p>
        </div>
      )}

      {/* Error state */}
      {state.status === "error" && (
        <div style={resultSectionStyle}>
          <AppErrorDisplay
            error={state.message}
            onRetry={handleRegenerate}
          />
        </div>
      )}

      {/* Success state */}
      {state.status === "success" && (
        <div style={resultSectionStyle}>
          <div style={resultCardStyle}>
            <h2 style={resultTitleStyle}>{state.result.title}</h2>
            <pre style={previewStyle}>{state.result.mklySource}</pre>

            {state.result.warning === "validation_incomplete" && (
              <div style={warningStyle} role="status">
                <AlertTriangle size={16} style={warningIconStyle} aria-hidden="true" />
                <span>
                  The generated content may have minor formatting issues — review before publishing.
                </span>
              </div>
            )}

            <div style={buttonRowStyle}>
              <button
                type="button"
                style={primaryButtonStyle}
                onClick={() => void handleSendToEditor()}
              >
                <Send size={16} aria-hidden="true" />
                Send to Editor
              </button>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={handleRegenerate}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
