import { type CSSProperties, useCallback, useState } from "react";
import { Menu } from "lucide-react";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const toolbarStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.625rem 1rem",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderBottom: "1px solid var(--milkly-border)",
  fontFamily: "var(--milkly-font-sans)",
};

const titleInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "0.375rem 0.625rem",
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "var(--milkly-fg-primary)",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: "var(--milkly-radius-md)",
  fontFamily: "var(--milkly-font-sans)",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const autoSaveStatusStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const saveBtnStyle: CSSProperties = {
  flexShrink: 0,
  padding: "0.4375rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  border: "none",
  background: "var(--milkly-brand)",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
  transition: "opacity 0.15s ease",
};

const saveBtnDisabledStyle: CSSProperties = {
  ...saveBtnStyle,
  opacity: 0.55,
  cursor: "not-allowed",
};

const menuBtnStyle: CSSProperties = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "transparent",
  color: "var(--milkly-fg-primary)",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
  transition: "background 0.12s ease",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeSince(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 min ago";
  return `${minutes} mins ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EditorToolbarProps {
  /** Current draft title (controlled) */
  title: string;
  /** Called when the user edits the title input */
  onTitleChange: (title: string) => void;
  /** Called when the user clicks Save Draft */
  onSave: () => Promise<void>;
  /** Whether a save is in-flight */
  isSaving: boolean;
  /** Whether the auto-save is currently in-flight */
  isAutoSaving: boolean;
  /** Timestamp of the last successful save (auto or manual) */
  lastSavedAt: Date | null;
  /** Called when the user clicks the menu trigger button */
  onMenuOpen: () => void;
}

export function EditorToolbar({
  title,
  onTitleChange,
  onSave,
  isSaving,
  isAutoSaving,
  lastSavedAt,
  onMenuOpen,
}: EditorToolbarProps): JSX.Element {
  const [, forceUpdate] = useState(0);

  // Re-render every 10 seconds so the "N seconds ago" label stays fresh
  // without a dedicated interval — it only matters when the toolbar is visible
  const refreshLabel = useCallback(() => {
    if (lastSavedAt !== null) {
      forceUpdate((n) => n + 1);
    }
  }, [lastSavedAt]);

  // Lightweight label re-render on mouse-enter to avoid keeping a timer alive
  const handleMouseEnter = useCallback(() => {
    refreshLabel();
  }, [refreshLabel]);

  function buildAutoSaveLabel(): string {
    if (isSaving) return "Saving…";
    if (isAutoSaving) return "Auto-saving…";
    if (lastSavedAt !== null) return `Saved ${formatTimeSince(lastSavedAt)}`;
    return "";
  }

  const autoSaveLabel = buildAutoSaveLabel();
  const saveDisabled = isSaving || isAutoSaving;

  function handleTitleFocus(e: React.FocusEvent<HTMLInputElement>): void {
    e.currentTarget.style.borderColor = "var(--milkly-border)";
  }

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>): void {
    e.currentTarget.style.borderColor = "transparent";
  }

  async function handleSaveClick(): Promise<void> {
    await onSave();
  }

  return (
    <header style={toolbarStyle} aria-label="Editor toolbar" onMouseEnter={handleMouseEnter}>
      <button
        type="button"
        style={menuBtnStyle}
        onClick={onMenuOpen}
        aria-label="Open menu"
        aria-haspopup="dialog"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--milkly-bg-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
      </button>

      <input
        type="text"
        placeholder="Untitled draft"
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
        }}
        onFocus={handleTitleFocus}
        onBlur={handleTitleBlur}
        style={titleInputStyle}
        aria-label="Draft title"
        maxLength={255}
      />

      {autoSaveLabel !== "" && (
        <span style={autoSaveStatusStyle} aria-live="polite" aria-atomic="true">
          {autoSaveLabel}
        </span>
      )}

      <button
        type="button"
        style={saveDisabled ? saveBtnDisabledStyle : saveBtnStyle}
        disabled={saveDisabled}
        onClick={() => {
          void handleSaveClick();
        }}
        aria-label="Save draft"
        aria-busy={isSaving}
      >
        Save Draft
      </button>
    </header>
  );
}
