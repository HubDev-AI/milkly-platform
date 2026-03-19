import { useState } from "react";
import type { CSSProperties, ReactElement } from "react";

export interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  className?: string | undefined;
}

const dividerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  margin: "16px 0",
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "13px",
  color: "var(--milkly-fg-secondary)",
};

const dividerLineStyle: CSSProperties = {
  flex: 1,
  height: "1px",
  backgroundColor: "var(--milkly-border)",
};

const buttonContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const buttonBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  width: "100%",
  height: "40px",
  paddingLeft: "16px",
  paddingRight: "16px",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  backgroundColor: "var(--milkly-bg-primary)",
  color: "var(--milkly-fg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "border-color 0.15s ease, background-color 0.15s ease",
  outline: "none",
  textDecoration: "none",
};

function GoogleIcon(): ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon(): ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12.72 9.27c-.02-2.07 1.69-3.07 1.77-3.12-0.97-1.41-2.47-1.6-3-1.63-1.27-.13-2.5.75-3.14.75-.65 0-1.64-.74-2.7-.72C4.06 4.58 2.6 5.53 1.82 7c-1.6 2.77-.41 6.86 1.14 9.1.76 1.1 1.67 2.33 2.86 2.28 1.15-.05 1.59-.74 2.98-.74 1.38 0 1.78.74 2.99.71 1.24-.02 2.02-1.11 2.78-2.21.88-1.27 1.24-2.5 1.26-2.57-.03-.01-2.41-.93-2.43-3.3zM10.67 2.94C11.28 2.2 11.7 1.18 11.58 0c-.88.04-1.96.59-2.59 1.33-.57.65-1.07 1.7-.93 2.7.97.07 1.97-.49 2.61-1.09z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SocialLoginButtons({
  onGoogleLogin,
  onAppleLogin,
  className,
}: SocialLoginButtonsProps): ReactElement {
  const [googleHovered, setGoogleHovered] = useState(false);
  const [appleHovered, setAppleHovered] = useState(false);

  const googleButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    borderColor: googleHovered ? "var(--milkly-fg-secondary)" : "var(--milkly-border)",
    backgroundColor: googleHovered ? "var(--milkly-bg-secondary, hsl(40 25% 94%))" : "var(--milkly-bg-primary)",
  };

  const appleButtonStyle: CSSProperties = {
    ...buttonBaseStyle,
    borderColor: appleHovered ? "var(--milkly-fg-secondary)" : "var(--milkly-border)",
    backgroundColor: appleHovered ? "var(--milkly-bg-secondary, hsl(40 25% 94%))" : "var(--milkly-bg-primary)",
  };

  return (
    <div className={className}>
      <div style={dividerStyle}>
        <span style={dividerLineStyle} />
        <span>Or continue with</span>
        <span style={dividerLineStyle} />
      </div>

      <div style={buttonContainerStyle}>
        <button
          type="button"
          style={googleButtonStyle}
          onClick={onGoogleLogin}
          onMouseEnter={() => { setGoogleHovered(true); }}
          onMouseLeave={() => { setGoogleHovered(false); }}
          aria-label="Sign in with Google"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          style={appleButtonStyle}
          onClick={onAppleLogin}
          onMouseEnter={() => { setAppleHovered(true); }}
          onMouseLeave={() => { setAppleHovered(false); }}
          aria-label="Sign in with Apple"
        >
          <AppleIcon />
          <span>Continue with Apple</span>
        </button>
      </div>
    </div>
  );
}
