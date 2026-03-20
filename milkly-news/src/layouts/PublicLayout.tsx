import type { CSSProperties } from "react";
import { Link, Outlet } from "react-router-dom";

const layoutStyle: CSSProperties = {
  minHeight: "100dvh",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 2rem",
  borderBottom: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

const brandStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "1.5rem",
  fontWeight: 600,
  color: "var(--milkly-brand)",
  textDecoration: "none",
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const navLinkStyle: CSSProperties = {
  color: "var(--milkly-fg-secondary)",
  textDecoration: "none",
};

const mainStyle: CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "2rem",
};

export function PublicLayout(): JSX.Element {
  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <Link to="/" style={brandStyle} aria-label="milkly.news home">
          milkly.news
        </Link>
        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>
            Home
          </Link>
        </nav>
      </header>
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}
