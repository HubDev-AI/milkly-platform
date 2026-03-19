import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { AppErrorDisplay, LoadingSkeleton } from "milkly-shared/components";
import type { Template } from "milkly-shared/types";
import { apiClient } from "@/lib/api-client";
import { useDrafts } from "@/hooks/useDrafts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { EditorToolbar } from "@/components/EditorToolbar";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";

// ---------------------------------------------------------------------------
// TODO: integrate @mklyml/editor when package available
// Using textarea fallback until @mklyml/editor is resolvable from npm.
// ---------------------------------------------------------------------------

interface MklyEditorFallbackProps {
  value: string;
  onChange: (source: string) => void;
  readOnly?: boolean | undefined;
}

function MklyEditorFallback({
  value,
  onChange,
  readOnly = false,
}: MklyEditorFallbackProps): JSX.Element {
  const editorAreaStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    resize: "none",
    border: "none",
    outline: "none",
    padding: "2rem 3rem",
    fontSize: "1rem",
    lineHeight: 1.7,
    fontFamily: "var(--milkly-font-sans)",
    color: "var(--milkly-fg-primary)",
    background: "var(--milkly-bg-primary)",
    boxSizing: "border-box",
  };

  return (
    <textarea
      style={editorAreaStyle}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      readOnly={readOnly}
      aria-label="mkly editor"
      aria-multiline="true"
      spellCheck
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const viewportStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  overflow: "hidden",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
};

const editorContainerStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const loadingContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "2rem 3rem",
  flex: 1,
};

const errorContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  padding: "2rem",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorView(): JSX.Element {
  const { drafts, createDraft, updateDraft, isLoading: draftsLoading, error: draftsError } = useDrafts();

  // Current editor state
  const [mklySource, setMklySource] = useState<string>("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Template loading state
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const hasInitializedRef = useRef(false);

  // Manual save state
  const [isManuallySaving, setIsManuallySaving] = useState(false);
  const [manualSaveError, setManualSaveError] = useState<string | null>(null);

  // Dialog state for pending navigation
  const [pendingNavCallback, setPendingNavCallback] = useState<(() => void) | null>(null);
  const [isDialogSaving, setIsDialogSaving] = useState(false);

  // Hooks
  const { lastSavedAt, isSaving: isAutoSaving } = useAutoSave({
    mklySource,
    draftId,
    updateDraft,
  });

  const { isDirty, setHasChanges } = useUnsavedChanges();

  // ---------------------------------------------------------------------------
  // Initialization: load most-recent draft or default template
  // ---------------------------------------------------------------------------

  const loadDefaultTemplate = useCallback(async () => {
    setIsLoadingTemplate(true);
    setTemplateError(null);
    try {
      const response = await apiClient.get<Template[]>("/templates");
      const defaultTemplate = response.data.find((t) => t.isDefault);
      const source = defaultTemplate?.mklySource ?? "";
      setMklySource(source);
      setIsInitialized(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load default template.";
      setTemplateError(message);
    } finally {
      setIsLoadingTemplate(false);
    }
  }, []);

  useEffect(() => {
    // Wait until the drafts query has resolved before deciding what to load
    if (draftsLoading) return;
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (drafts.length > 0) {
      // Sort defensively — API already returns desc by updatedAt, take first
      const mostRecent = drafts[0];
      if (mostRecent !== undefined) {
        setDraftId(mostRecent.id);
        setMklySource(mostRecent.mklySource);
        setTitle(mostRecent.title ?? "");
        setIsInitialized(true);
      }
    } else {
      // No drafts — fall back to default template
      void loadDefaultTemplate();
    }
  }, [draftsLoading, drafts, loadDefaultTemplate]);

  // ---------------------------------------------------------------------------
  // Handle editor content changes
  // ---------------------------------------------------------------------------

  const handleEditorChange = useCallback(
    (source: string) => {
      setMklySource(source);
      setHasChanges(true);
    },
    [setHasChanges],
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setHasChanges(true);
  }, [setHasChanges]);

  // ---------------------------------------------------------------------------
  // Manual save
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(async () => {
    setIsManuallySaving(true);
    setManualSaveError(null);

    try {
      if (draftId !== null) {
        await updateDraft({ id: draftId, mklySource, title: title || undefined });
      } else {
        const newDraft = await createDraft({
          mklySource,
          title: title || undefined,
        });
        setDraftId(newDraft.id);
      }
      setHasChanges(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft.";
      setManualSaveError(message);
    } finally {
      setIsManuallySaving(false);
    }
  }, [draftId, mklySource, title, updateDraft, createDraft, setHasChanges]);

  // ---------------------------------------------------------------------------
  // Unsaved changes dialog
  // ---------------------------------------------------------------------------

  const handleDialogSave = useCallback(async () => {
    setIsDialogSaving(true);
    try {
      await handleSave();
      const cb = pendingNavCallback;
      setPendingNavCallback(null);
      cb?.();
    } catch {
      // Save failed — stay on page
    } finally {
      setIsDialogSaving(false);
    }
  }, [handleSave, pendingNavCallback]);

  const handleDialogDiscard = useCallback(() => {
    setHasChanges(false);
    const cb = pendingNavCallback;
    setPendingNavCallback(null);
    cb?.();
  }, [pendingNavCallback, setHasChanges]);

  const handleDialogCancel = useCallback(() => {
    setPendingNavCallback(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading / error states
  // ---------------------------------------------------------------------------

  const isLoading = draftsLoading || isLoadingTemplate || !isInitialized;

  // Show draft fetch error only if there's no template fallback in progress
  const showDraftError =
    draftsError !== null && !isLoading && !isInitialized;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={viewportStyle}>
      <EditorToolbar
        title={title}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        isSaving={isManuallySaving}
        isAutoSaving={isAutoSaving}
        lastSavedAt={lastSavedAt}
      />

      <main style={editorContainerStyle} aria-label="Editor">
        {isLoading && (
          <div style={loadingContainerStyle} aria-busy="true" aria-live="polite">
            <LoadingSkeleton height="2rem" width="40%" />
            <LoadingSkeleton height="1rem" />
            <LoadingSkeleton height="1rem" width="90%" />
            <LoadingSkeleton height="1rem" width="80%" />
            <LoadingSkeleton height="1rem" />
            <LoadingSkeleton height="1rem" width="75%" />
          </div>
        )}

        {!isLoading && showDraftError && (
          <div style={errorContainerStyle}>
            <AppErrorDisplay
              error={draftsError?.message ?? "Failed to load drafts."}
              onRetry={() => {
                hasInitializedRef.current = false;
                void loadDefaultTemplate();
              }}
            />
          </div>
        )}

        {!isLoading && templateError !== null && (
          <div style={errorContainerStyle}>
            <AppErrorDisplay
              error={templateError}
              onRetry={() => {
                hasInitializedRef.current = false;
                void loadDefaultTemplate();
              }}
            />
          </div>
        )}

        {!isLoading && manualSaveError !== null && (
          <div style={{ padding: "0 1rem" }}>
            <AppErrorDisplay
              error={manualSaveError}
              onRetry={() => {
                setManualSaveError(null);
                void handleSave();
              }}
            />
          </div>
        )}

        {!isLoading && templateError === null && !showDraftError && (
          <MklyEditorFallback
            value={mklySource}
            onChange={handleEditorChange}
          />
        )}
      </main>

      <UnsavedChangesDialog
        isOpen={pendingNavCallback !== null && isDirty}
        isSaving={isDialogSaving}
        onSave={() => {
          void handleDialogSave();
        }}
        onDiscard={handleDialogDiscard}
        onCancel={handleDialogCancel}
      />
    </div>
  );
}
