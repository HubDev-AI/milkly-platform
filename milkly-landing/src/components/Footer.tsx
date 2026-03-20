import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const footerStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "1.5rem 2rem",
  borderTop: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "0.8125rem",
  color: "var(--milkly-fg-tertiary)",
};

const brandStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontWeight: 600,
  color: "var(--milkly-fg-secondary)",
};

const navStyle: CSSProperties = {
  display: "flex",
  gap: "1.25rem",
};

const linkStyle: CSSProperties = {
  color: "var(--milkly-fg-tertiary)",
  textDecoration: "none",
};

export function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer style={footerStyle}>
      <span>
        <span style={brandStyle}>milkly</span> &copy; {year}
      </span>
      <nav style={navStyle} aria-label="Footer navigation">
        <Link to="/privacy" style={linkStyle}>
          Privacy
        </Link>
        <Link to="/terms" style={linkStyle}>
          Terms
        </Link>
      </nav>
    </footer>
  );
}
