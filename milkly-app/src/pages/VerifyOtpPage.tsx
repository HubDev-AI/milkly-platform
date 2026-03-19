import type { CSSProperties } from "react";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { OtpInput, AppErrorDisplay } from "milkly-shared/components";
import { authClient } from "@/lib/auth-client";

const pageStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  padding: "1rem",
};

const cardStyle: CSSProperties = {
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(var(--milkly-glass-blur))",
  WebkitBackdropFilter: "blur(var(--milkly-glass-blur))",
  border: "var(--milkly-glass-border)",
  borderRadius: "var(--milkly-radius-lg)",
  boxShadow: "var(--milkly-shadow-lg)",
  padding: "2rem",
  width: "100%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.5rem",
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  letterSpacing: "-0.01em",
  textAlign: "center",
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  textAlign: "center",
};

const backLinkStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-brand)",
  textDecoration: "none",
  marginTop: "0.25rem",
};

export function VerifyOtpPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleComplete(otp: string): Promise<void> {
    setError(undefined);
    try {
      await authClient.verifyOtp(email, otp);
      void navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    }
  }

  return (
    <main style={pageStyle} aria-label="Verify OTP page">
      <div style={cardStyle}>
        <h2 style={headingStyle}>Check your email</h2>
        <p style={subtitleStyle}>
          {email
            ? `We sent a 6-digit code to ${email}`
            : "Enter the 6-digit code we sent to your email"}
        </p>

        <OtpInput
          onComplete={(otp) => {
            void handleComplete(otp);
          }}
          error={error}
        />

        {error !== undefined && (
          <AppErrorDisplay
            error={error}
            onRetry={() => {
              setError(undefined);
            }}
          />
        )}

        <Link to="/login" style={backLinkStyle}>
          Back to login
        </Link>
      </div>
    </main>
  );
}
