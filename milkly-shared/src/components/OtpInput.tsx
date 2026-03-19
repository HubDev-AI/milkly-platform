import { useState, useRef, useCallback } from "react";

export interface OtpInputProps {
  onComplete: (otp: string) => void;
  length?: number | undefined;
  error?: string | undefined;
}

const FONT_MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";
const DESTRUCTIVE_COLOR = "hsl(0 84% 60%)";

export function OtpInput({ onComplete, length = 6, error }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(
    Array(length).fill(null)
  );

  const focusInput = useCallback((index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const handleChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const digit = rawValue.replace(/\D/g, "").slice(-1);

      setDigits((prev) => {
        const next = [...prev];
        next[index] = digit;

        if (digit && index < length - 1) {
          // Focus next after state update
          requestAnimationFrame(() => focusInput(index + 1));
        }

        const otp = next.join("");
        if (otp.length === length && !otp.includes("")) {
          onComplete(otp);
        }

        return next;
      });
    },
    [length, onComplete, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Backspace") {
        setDigits((prev) => {
          const next = [...prev];
          if (next[index] !== "") {
            next[index] = "";
            return next;
          }
          // Current field already empty — move to previous
          if (index > 0) {
            next[index - 1] = "";
            requestAnimationFrame(() => focusInput(index - 1));
          }
          return next;
        });
        event.preventDefault();
      } else if (event.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
        event.preventDefault();
      } else if (event.key === "ArrowRight" && index < length - 1) {
        focusInput(index + 1);
        event.preventDefault();
      }
    },
    [length, focusInput]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      const pasted = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, length);

      if (!pasted) return;

      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < length; i++) {
          next[i] = pasted[i] ?? "";
        }

        const otp = next.join("");
        if (otp.length === length && !otp.includes("")) {
          onComplete(otp);
        }

        const lastFilledIndex = Math.min(pasted.length, length - 1);
        requestAnimationFrame(() => focusInput(lastFilledIndex));

        return next;
      });
    },
    [length, onComplete, focusInput]
  );

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
  };

  const inputStyle = (isFilled: boolean, hasError: boolean): React.CSSProperties => ({
    width: "44px",
    height: "52px",
    textAlign: "center",
    fontSize: "20px",
    fontFamily: FONT_MONO,
    fontWeight: 600,
    color: "var(--milkly-fg-primary)",
    background: "var(--milkly-bg-primary)",
    border: `1.5px solid ${hasError ? DESTRUCTIVE_COLOR : isFilled ? "var(--milkly-brand)" : "var(--milkly-border)"}`,
    borderRadius: "var(--milkly-radius-md)",
    outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    cursor: "text",
  });

  const errorStyle: React.CSSProperties = {
    fontSize: "14px",
    color: DESTRUCTIVE_COLOR,
    textAlign: "center",
    fontFamily: "var(--milkly-font-sans)",
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} of ${length}`}
            style={inputStyle(digit !== "", error !== undefined)}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => {
              e.target.select();
            }}
          />
        ))}
      </div>
      {error !== undefined && (
        <p style={errorStyle} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
