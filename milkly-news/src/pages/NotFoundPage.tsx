import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "50dvh",
  gap: "1rem",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
  textAlign: "center",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2rem",
  fontWeight: 600,
  margin: 0,
};

const messageStyle: CSSProperties = {
  fontSize: "1rem",
  color: "var(--milkly-fg-secondary)",
  margin: 0,
};

const linkStyle: CSSProperties = {
  marginTop: "0.5rem",
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-brand)",
  color: "#fff",
  textDecoration: "none",
  fontFamily: "var(--milkly-font-sans)",
};

export function NotFoundPage(): JSX.Element {
  return (
    <div style={containerStyle} data-page="not-found">
      <h1 style={headingStyle}>Page not found</h1>
      <p style={messageStyle}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" style={linkStyle}>
        Browse newsletters
      </Link>
    </div>
  );
}
