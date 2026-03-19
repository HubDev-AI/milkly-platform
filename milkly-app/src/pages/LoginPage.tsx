import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm, SocialLoginButtons } from "milkly-shared/components";
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

const cardWrapperStyle: CSSProperties = {
  width: "100%",
  maxWidth: "400px",
};

export function LoginPage(): JSX.Element {
  const navigate = useNavigate();

  async function handleSendOtp(email: string): Promise<void> {
    await authClient.sendOtp(email);
    void navigate(`/verify?email=${encodeURIComponent(email)}`);
  }

  function handleSuccess(): void {
    // LoginForm calls onSuccess after onSendOtp resolves — navigation already
    // triggered inside handleSendOtp, so this is a no-op here.
  }

  function handleGoogleLogin(): void {
    window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/social/google?callbackURL=${encodeURIComponent(window.location.origin + "/auth/callback")}`;
  }

  function handleAppleLogin(): void {
    window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/auth/social/apple?callbackURL=${encodeURIComponent(window.location.origin + "/auth/callback")}`;
  }

  return (
    <main style={pageStyle} aria-label="Login page">
      <div style={cardWrapperStyle}>
        <LoginForm
          onSendOtp={handleSendOtp}
          onSuccess={handleSuccess}
        />
        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          onAppleLogin={handleAppleLogin}
        />
      </div>
    </main>
  );
}
