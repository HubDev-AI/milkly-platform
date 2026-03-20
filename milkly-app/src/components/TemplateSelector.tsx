import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Template } from "milkly-shared/types";
import { AppErrorDisplay, LoadingSkeleton } from "milkly-shared/components";
import { apiClient } from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

const TEMPLATES_QUERY_KEY = ["templates"] as const;

function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<Template[]>("/templates");
      return response.data;
    },
    retry: (failureCount) => failureCount < 2,
    staleTime: 5 * 60 * 1000, // 5 min — templates change infrequently
  });
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "hsla(20 10% 15% / 0.45)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  padding: "1rem",
};

const panelStyle: CSSProperties = {
  width: "100%",
  maxWidth: "680px",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-lg)",
  boxShadow: "var(--milkly-shadow-lg)",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--milkly-border)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.0625rem",
  fontWeight: 700,
  lineHeight: 1.3,
};

const closeBtnStyle: CSSProperties = {
  padding: "0.25rem 0.5rem",
  fontSize: "1.125rem",
  background: "transparent",
  border: "none",
  color: "var(--milkly-fg-secondary)",
  cursor: "pointer",
  borderRadius: "var(--milkly-radius-sm)",
  lineHeight: 1,
};

const bodyStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "1.25rem 1.5rem",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "1rem",
};

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-bg-secondary)",
  cursor: "pointer",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

const cardHoverStyle: CSSProperties = {
  ...cardStyle,
  borderColor: "var(--milkly-brand)",
  boxShadow: "0 0 0 1px var(--milkly-brand)",
};

const cardNameStyle: CSSProperties = {
  margin: "0 0 0.375rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: 1.35,
};

const cardPreviewStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.75rem",
  color: "var(--milkly-fg-tertiary)",
  lineHeight: 1.5,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
};

const cardDescStyle: CSSProperties = {
  margin: "0.25rem 0 0",
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.45,
};

const emptyStyle: CSSProperties = {
  textAlign: "center",
  padding: "2rem 1rem",
  color: "var(--milkly-fg-secondary)",
  fontSize: "0.875rem",
};

const loadingContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const errorContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "1rem",
};

// ---------------------------------------------------------------------------
// Warning dialog styles (reusing the same token palette)
// ---------------------------------------------------------------------------

const warningCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-md)",
  boxShadow: "var(--milkly-shadow-lg)",
  padding: "1.75rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
};

const warningHeadingStyle: CSSProperties = {
  margin: "0 0 0.5rem",
  fontSize: "1.0625rem",
  fontWeight: 700,
  lineHeight: 1.3,
};

const warningBodyTextStyle: CSSProperties = {
  margin: "0 0 1.5rem",
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.55,
};

const warningActionsStyle: CSSProperties = {
  display: "flex",
  gap: "0.625rem",
  justifyContent: "flex-end",
};

const baseBtnStyle: CSSProperties = {
  padding: "0.5rem 1.125rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
  transition: "opacity 0.15s ease",
};

const cancelBtnStyle: CSSProperties = {
  ...baseBtnStyle,
  background: "transparent",
  color: "var(--milkly-fg-secondary)",
  border: "1px solid var(--milkly-border)",
};

const proceedBtnStyle: CSSProperties = {
  ...baseBtnStyle,
  background: "var(--milkly-brand)",
  color: "#fff",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onSelect,
}: {
  template: Template;
  onSelect: () => void;
}): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);

  // Build a short preview from mklySource
  const previewSnippet =
    template.mklySource.length > 120
      ? `${template.mklySource.slice(0, 120)}...`
      : template.mklySource;

  return (
    <button
      type="button"
      style={isHovered ? cardHoverStyle : cardStyle}
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => { setIsHovered(false); }}
      onFocus={() => { setIsHovered(true); }}
      onBlur={() => { setIsHovered(false); }}
      onClick={onSelect}
      aria-label={`Select template: ${template.name}`}
    >
      <p style={cardNameStyle}>{template.name}</p>
      {template.description !== null && (
        <p style={cardDescStyle}>{template.description}</p>
      )}
      <p style={cardPreviewStyle}>{previewSnippet}</p>
    </button>
  );
}

interface UnsavedWarningDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onProceed: () => void;
}

function UnsavedWarningDialog({
  isOpen,
  onCancel,
  onProceed,
}: UnsavedWarningDialogProps): JSX.Element | null {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={overlayStyle}
      role="presentation"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="template-warning-title"
        aria-describedby="template-warning-body"
        style={warningCardStyle}
      >
        <h2 id="template-warning-title" style={warningHeadingStyle}>
          Unsaved changes
        </h2>
        <p id="template-warning-body" style={warningBodyTextStyle}>
          Loading a new template will replace your current content. Save your work first, or proceed to discard unsaved changes.
        </p>
        <div style={warningActionsStyle}>
          <button
            ref={cancelRef}
            type="button"
            style={cancelBtnStyle}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            style={proceedBtnStyle}
            onClick={onProceed}
          >
            Load template
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export interface TemplateSelectorProps {
  /** Whether the template selector panel is open */
  isOpen: boolean;
  /** Close the selector */
  onClose: () => void;
  /** Called with the mklySource of the selected template */
  onSelect: (templateMklySource: string) => void;
  /** When true, show a warning before loading a template */
  hasUnsavedChanges: boolean;
}

/**
 * Modal panel that displays available templates in a grid.
 * Fetches from GET /templates. Shows loading/error/empty states.
 * If the editor has unsaved changes, a warning dialog is shown before loading.
 */
export function TemplateSelector({
  isOpen,
  onClose,
  onSelect,
  hasUnsavedChanges,
}: TemplateSelectorProps): JSX.Element | null {
  const { data: templates, isLoading, error, refetch } = useTemplates();

  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus close button when panel opens
  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => {
        closeBtnRef.current?.focus();
      });
      return () => {
        cancelAnimationFrame(id);
      };
    }
    return undefined;
  }, [isOpen]);

  // ESC closes the panel
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleTemplateSelect = useCallback(
    (mklySource: string) => {
      if (hasUnsavedChanges) {
        setPendingSource(mklySource);
      } else {
        onSelect(mklySource);
        onClose();
      }
    },
    [hasUnsavedChanges, onSelect, onClose],
  );

  const handleWarningCancel = useCallback(() => {
    setPendingSource(null);
  }, []);

  const handleWarningProceed = useCallback(() => {
    if (pendingSource !== null) {
      onSelect(pendingSource);
      setPendingSource(null);
      onClose();
    }
  }, [pendingSource, onSelect, onClose]);

  if (!isOpen) return null;

  const hasTemplates = templates !== undefined && templates.length > 0;

  return (
    <>
      <div
        style={overlayStyle}
        role="presentation"
        aria-hidden="false"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-selector-title"
          style={panelStyle}
        >
          <div style={headerStyle}>
            <h2 id="template-selector-title" style={titleStyle}>
              Choose a template
            </h2>
            <button
              ref={closeBtnRef}
              type="button"
              style={closeBtnStyle}
              onClick={onClose}
              aria-label="Close template selector"
            >
              &times;
            </button>
          </div>

          <div style={bodyStyle}>
            {isLoading && (
              <div style={loadingContainerStyle} aria-busy="true" aria-live="polite">
                <LoadingSkeleton height="2rem" width="40%" />
                <LoadingSkeleton height="6rem" />
                <LoadingSkeleton height="6rem" width="90%" />
              </div>
            )}

            {!isLoading && error !== null && (
              <div style={errorContainerStyle}>
                <AppErrorDisplay
                  error={error instanceof Error ? error.message : "Failed to load templates."}
                  onRetry={() => {
                    void refetch();
                  }}
                />
              </div>
            )}

            {!isLoading && error === null && !hasTemplates && (
              <div style={emptyStyle}>
                <p>No templates available yet. Start with a blank canvas.</p>
              </div>
            )}

            {!isLoading && error === null && hasTemplates && (
              <div style={gridStyle}>
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => {
                      handleTemplateSelect(template.mklySource);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UnsavedWarningDialog
        isOpen={pendingSource !== null}
        onCancel={handleWarningCancel}
        onProceed={handleWarningProceed}
      />
    </>
  );
}
