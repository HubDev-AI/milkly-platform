import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

// ---------------------------------------------------------------------------
// Onboarding steps
// ---------------------------------------------------------------------------

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: "Write your content",
    description:
      "Use the editor to compose your newsletter. Rich formatting is applied automatically with mkly markup.",
    icon: "\u270F\uFE0F",
  },
  {
    title: "Preview your work",
    description:
      "Switch to preview mode to see how your newsletter will look to subscribers before publishing.",
    icon: "\uD83D\uDC41\uFE0F",
  },
  {
    title: "Save your draft",
    description:
      "Your work auto-saves every 30 seconds. Hit Save Draft anytime for an instant save.",
    icon: "\uD83D\uDCBE",
  },
  {
    title: "Publish via menu",
    description:
      "When you\u2019re ready, open the menu to publish your newsletter and distribute it to subscribers.",
    icon: "\uD83D\uDE80",
  },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "hsla(20 10% 15% / 0.5)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  padding: "1rem",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--milkly-border)",
  borderRadius: "var(--milkly-radius-lg)",
  boxShadow: "var(--milkly-shadow-lg)",
  padding: "2rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
};

const headingStyle: CSSProperties = {
  margin: "0 0 0.25rem",
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  lineHeight: 1.3,
};

const subheadingStyle: CSSProperties = {
  margin: "0 0 1.5rem",
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.5,
};

const stepContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.75rem",
};

const stepStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.875rem",
};

const stepIconStyle: CSSProperties = {
  flexShrink: 0,
  width: "2.25rem",
  height: "2.25rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-bg-secondary)",
  fontSize: "1rem",
};

const stepTextContainerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const stepTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  fontWeight: 600,
  lineHeight: 1.35,
};

const stepDescStyle: CSSProperties = {
  margin: "0.125rem 0 0",
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-secondary)",
  lineHeight: 1.5,
};

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const stepIndicatorStyle: CSSProperties = {
  display: "flex",
  gap: "0.375rem",
};

const dotBaseStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "var(--milkly-border)",
  transition: "background 0.2s ease",
};

const dotActiveStyle: CSSProperties = {
  ...dotBaseStyle,
  background: "var(--milkly-brand)",
};

const dismissBtnStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
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

const nextBtnStyle: CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "transparent",
  color: "var(--milkly-fg-primary)",
  cursor: "pointer",
  fontFamily: "var(--milkly-font-sans)",
  transition: "opacity 0.15s ease",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface OnboardingOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Called when the user finishes or dismisses the onboarding */
  onDismiss: () => void;
}

/**
 * Full-screen onboarding overlay for first-time creators.
 * Walks through 4 steps: Edit, Preview, Save, Publish.
 * Accessible: focus trap, ESC to dismiss, aria-modal.
 */
export function OnboardingOverlay({
  isOpen,
  onDismiss,
}: OnboardingOverlayProps): JSX.Element | null {
  const [currentStep, setCurrentStep] = useState(0);
  const dismissBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const isLastStep = currentStep === STEPS.length - 1;

  // Focus the primary action when the overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay so the DOM has settled
      const id = requestAnimationFrame(() => {
        dismissBtnRef.current?.focus();
      });
      return () => {
        cancelAnimationFrame(id);
      };
    }
    return undefined;
  }, [isOpen]);

  // ESC key dismisses
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onDismiss();
        return;
      }

      // Basic focus trap between the two buttons
      if (event.key === "Tab") {
        const focusableEls = [nextBtnRef.current, dismissBtnRef.current].filter(
          (el): el is HTMLButtonElement => el !== null,
        );
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
  }, [isOpen, onDismiss]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onDismiss();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onDismiss]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  if (step === undefined) return null;

  return (
    <div
      style={overlayStyle}
      role="presentation"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onDismiss();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-subtitle"
        style={cardStyle}
      >
        <h2 id="onboarding-title" style={headingStyle}>
          Welcome to Milkly
        </h2>
        <p id="onboarding-subtitle" style={subheadingStyle}>
          Here&apos;s how to create your first newsletter.
        </p>

        <div style={stepContainerStyle} aria-live="polite">
          <div style={stepStyle}>
            <div style={stepIconStyle} aria-hidden="true">
              {step.icon}
            </div>
            <div style={stepTextContainerStyle}>
              <p style={stepTitleStyle}>
                {currentStep + 1}. {step.title}
              </p>
              <p style={stepDescStyle}>{step.description}</p>
            </div>
          </div>
        </div>

        <div style={footerStyle}>
          <div style={stepIndicatorStyle} aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                style={idx === currentStep ? dotActiveStyle : dotBaseStyle}
                aria-hidden="true"
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!isLastStep && (
              <button
                ref={dismissBtnRef}
                type="button"
                style={nextBtnStyle}
                onClick={onDismiss}
              >
                Skip
              </button>
            )}
            <button
              ref={isLastStep ? dismissBtnRef : nextBtnRef}
              type="button"
              style={dismissBtnStyle}
              onClick={handleNext}
            >
              {isLastStep ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
