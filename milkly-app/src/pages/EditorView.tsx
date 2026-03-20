import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { AppErrorDisplay, LoadingSkeleton } from "milkly-shared/components";
import type { Template } from "milkly-shared/types";
import { useEditorStore } from "@mklyml/editor/store/editor-store";
import { apiClient } from "@/lib/api-client";
import { useDrafts } from "@/hooks/useDrafts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EmbeddedMklyEditor } from "@/components/EmbeddedMklyEditor";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { MenuDialog } from "@/components/MenuDialog";

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
  const { drafts, createDraft, updateDraft, refetchDrafts, isLoading: draftsLoading, error: draftsError } = useDrafts();

  // Read source from the mklyml editor's zustand store
  const mklySource = useEditorStore((s) => s.source);

  // Current editor state (non-source)
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

  // Menu dialog state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dialog state for in-app navigation protection.
  // In the current single-view architecture, the only navigation guard is beforeunload (browser tab close).
  // The dialog infrastructure is forward-looking: when additional routes are added, wire useBlocker from
  // react-router-dom to set pendingNavCallback, which opens the UnsavedChangesDialog.
  const [pendingNavCallback, setPendingNavCallback] = useState<(() => void) | null>(null);
  const [isDialogSaving, setIsDialogSaving] = useState(false);

  // Hooks
  const { lastSavedAt, isSaving: isAutoSaving } = useAutoSave({
    mklySource,
    draftId,
    updateDraft,
  });

  const { isDirty, setHasChanges } = useUnsavedChanges();

  // Track editor store source changes for dirty detection
  useEffect(() => {
    const unsub = useEditorStore.subscribe(
      (state, prev) => {
        if (state.source !== prev.source) {
          setHasChanges(true);
        }
      },
    );
    return unsub;
  }, [setHasChanges]);

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
      useEditorStore.getState().setSource(source);
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
        useEditorStore.getState().setSource(mostRecent.mklySource);
        setTitle(mostRecent.title ?? "");
        setIsInitialized(true);
      }
    } else {
      // No drafts — fall back to default template
      void loadDefaultTemplate();
    }
  }, [draftsLoading, drafts, loadDefaultTemplate]);

  // ---------------------------------------------------------------------------
  // Handle title changes
  // ---------------------------------------------------------------------------

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
    const currentSource = useEditorStore.getState().source;

    try {
      if (draftId !== null) {
        await updateDraft({ id: draftId, mklySource: currentSource, title: title || undefined });
      } else {
        const newDraft = await createDraft({
          mklySource: currentSource,
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
  }, [draftId, title, updateDraft, createDraft, setHasChanges]);

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
        onMenuOpen={() => { setIsMenuOpen(true); }}
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
                void refetchDrafts();
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
          <EmbeddedMklyEditor documentId={draftId ?? undefined} />
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

      <MenuDialog
        isOpen={isMenuOpen}
        onClose={() => { setIsMenuOpen(false); }}
      />
    </div>
  );
}
