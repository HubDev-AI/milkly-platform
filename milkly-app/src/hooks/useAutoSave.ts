import { useState, useEffect, useRef, useCallback } from "react";
import type { UpdateDraftInput } from "@/hooks/useDrafts";

const AUTO_SAVE_INTERVAL_MS = 30_000;

export interface UseAutoSaveOptions {
  mklySource: string;
  draftId: string | null;
  updateDraft: (input: UpdateDraftInput) => Promise<unknown>;
}

export interface UseAutoSaveResult {
  lastSavedAt: Date | null;
  isSaving: boolean;
}

export function useAutoSave({
  mklySource,
  draftId,
  updateDraft,
}: UseAutoSaveOptions): UseAutoSaveResult {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Track the content that was last successfully saved to the API
  const lastSavedContentRef = useRef<string | null>(null);
  // Track current content to compare in interval without stale closure issues
  const currentContentRef = useRef(mklySource);
  const draftIdRef = useRef(draftId);
  const updateDraftRef = useRef(updateDraft);

  // Keep refs in sync with latest props
  currentContentRef.current = mklySource;
  draftIdRef.current = draftId;
  updateDraftRef.current = updateDraft;

  const save = useCallback(async () => {
    const id = draftIdRef.current;
    const content = currentContentRef.current;

    if (id === null) return;
    if (content === lastSavedContentRef.current) return;

    setIsSaving(true);
    try {
      await updateDraftRef.current({ id, mklySource: content });
      lastSavedContentRef.current = content;
      setLastSavedAt(new Date());
    } catch {
      // Auto-save failures are silent — the user can save manually
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Set up the recurring auto-save interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      void save();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [save]);

  // On unmount: trigger a final save if the content is dirty
  useEffect(() => {
    return () => {
      const id = draftIdRef.current;
      const content = currentContentRef.current;
      if (id !== null && content !== lastSavedContentRef.current) {
        void updateDraftRef.current({ id, mklySource: content });
      }
    };
  }, []);

  // When draftId becomes available for the first time, treat current content
  // as the baseline (no immediate save needed unless content diverges later)
  useEffect(() => {
    if (draftId !== null && lastSavedContentRef.current === null) {
      lastSavedContentRef.current = mklySource;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  return { lastSavedAt, isSaving };
}
