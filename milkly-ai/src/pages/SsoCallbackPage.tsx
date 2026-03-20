import type { CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { SsoCallback } from "milkly-shared/components";

const pageStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100dvh",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
};

export function SsoCallbackPage(): JSX.Element {
  const [searchParams] = useSearchParams();

  return (
    <main style={pageStyle} aria-label="SSO callback">
      <SsoCallback searchParams={searchParams} />
    </main>
  );
}
