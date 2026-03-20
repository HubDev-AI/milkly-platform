import type { CSSProperties } from "react";

const placeholderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "50dvh",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-secondary)",
  fontSize: "1.125rem",
};

export function CreatorProfilePage(): JSX.Element {
  return (
    <div style={placeholderStyle}>
      <p>Creator Profile</p>
    </div>
  );
}
