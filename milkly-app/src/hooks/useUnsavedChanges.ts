import { useState, useEffect, useCallback } from "react";

export interface UseUnsavedChangesResult {
  /** True when the editor contains changes not yet persisted */
  isDirty: boolean;
  /** Alias exposed as hasChanges for caller clarity */
  hasChanges: boolean;
  /** Set the dirty flag externally (e.g. from the editor onChange handler) */
  setHasChanges: (value: boolean) => void;
  /**
   * Returns true if navigation is safe (no unsaved changes, or user confirmed
   * via the native browser dialog). For in-app navigation use the `isDirty`
   * state together with UnsavedChangesDialog (Task 6) which calls this setter.
   */
  confirmNavigation: () => boolean;
}

export function useUnsavedChanges(): UseUnsavedChangesResult {
  const [isDirty, setIsDirty] = useState(false);

  // Register/deregister the browser beforeunload handler as dirty state changes
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Returning a string (or calling preventDefault) triggers the native dialog
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const setHasChanges = useCallback((value: boolean) => {
    setIsDirty(value);
  }, []);

  /**
   * For programmatic in-app navigation guards that need a synchronous answer.
   * Returns true immediately when there are no unsaved changes.
   * When there are unsaved changes, the UnsavedChangesDialog (Task 6) should
   * be shown instead — this function returns false so callers can abort
   * navigation and let the dialog handle Save / Discard / Cancel.
   */
  const confirmNavigation = useCallback((): boolean => {
    if (!isDirty) return true;
    return false;
  }, [isDirty]);

  return {
    isDirty,
    hasChanges: isDirty,
    setHasChanges,
    confirmNavigation,
  };
}
