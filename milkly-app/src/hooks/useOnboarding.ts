import { useState, useCallback } from "react";

const STORAGE_KEY = "milkly-onboarding-dismissed";

export interface UseOnboardingResult {
  /** True when the onboarding overlay should be shown */
  showOnboarding: boolean;
  /** Dismiss the overlay and persist the decision in localStorage */
  dismissOnboarding: () => void;
}

function isOnboardingDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    // localStorage unavailable (private browsing, quota, etc.)
    return false;
  }
}

export function useOnboarding(): UseOnboardingResult {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(
    () => !isOnboardingDismissed(),
  );

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable — dismissed for this session only
    }
  }, []);

  return { showOnboarding, dismissOnboarding };
}
