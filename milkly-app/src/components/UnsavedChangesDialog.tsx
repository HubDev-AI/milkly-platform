import { useEffect, useRef, type CSSProperties } from "react";

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

const dialogStyle: CSSProperties = {
  width: "100%",
  maxWidth: "440px",
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

const headingStyle: CSSProperties = {
  margin: "0 0 0.5rem",
  fontSize: "1.0625rem",
  fontWeight: 700,
  lineHeight: 1.3,
};

const bodyStyle: CSSProperties = {
  margin: "0 0 1.5rem",
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.55,
};

const actionsStyle: CSSProperties = {
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

const saveBtnStyle: CSSProperties = {
  ...baseBtnStyle,
  background: "var(--milkly-brand)",
  color: "#fff",
};

const discardBtnStyle: CSSProperties = {
  ...baseBtnStyle,
  background: "transparent",
  color: "hsl(0 72% 51%)",
  border: "1px solid hsl(0 72% 51%)",
};

const cancelBtnStyle: CSSProperties = {
  ...baseBtnStyle,
  background: "transparent",
  color: "var(--milkly-fg-secondary)",
  border: "1px solid var(--milkly-border)",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isSaving?: boolean | undefined;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog shown when the user attempts in-app navigation with unsaved
 * editor changes. Provides Save, Discard, and Cancel actions.
 *
 * Accessibility: focus trap, ESC closes, aria-modal, aria-labelledby.
 */
export function UnsavedChangesDialog({
  isOpen,
  isSaving = false,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps): JSX.Element | null {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const discardBtnRef = useRef<HTMLButtonElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when the dialog opens
  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  // ESC key closes (cancel)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      // Basic focus trap: keep Tab/Shift+Tab within the dialog buttons
      if (event.key === "Tab") {
        const focusableEls = [
          saveBtnRef.current,
          discardBtnRef.current,
          cancelBtnRef.current,
        ].filter((el): el is HTMLButtonElement => el !== null);

        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
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
        // Clicking the backdrop cancels
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-body"
        style={dialogStyle}
      >
        <h2 id="unsaved-dialog-title" style={headingStyle}>
          Unsaved changes
        </h2>
        <p id="unsaved-dialog-body" style={bodyStyle}>
          You have unsaved changes. Would you like to save them before leaving?
        </p>

        <div style={actionsStyle}>
          <button
            ref={cancelBtnRef}
            type="button"
            style={cancelBtnStyle}
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            ref={discardBtnRef}
            type="button"
            style={discardBtnStyle}
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard
          </button>
          <button
            ref={saveBtnRef}
            type="button"
            style={saveBtnStyle}
            onClick={onSave}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
