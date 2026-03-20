import type { CSSProperties } from "react";
import { Link, Outlet } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { APP_URL } from "@/config";
import { createHoverHandlers } from "@/lib/hover-utils";

const layoutStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  background: "var(--milkly-bg-primary)",
  fontFamily: "var(--milkly-font-sans)",
  color: "var(--milkly-fg-primary)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 2rem",
  borderBottom: "1px solid var(--milkly-border-subtle)",
  background: "var(--milkly-bg-glass)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 50,
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
};

const navLinkStyle: CSSProperties = {
  color: "var(--milkly-fg-secondary)",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
};

const ctaLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.5rem 1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-brand)",
  color: "#fff",
  textDecoration: "none",
  transition: "background 0.15s ease",
};

const mainStyle: CSSProperties = {
  flex: 1,
};

export function PageLayout(): JSX.Element {
  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <Link to="/" style={brandStyle} aria-label="Milkly home">
          milkly
        </Link>
        <nav style={navStyle} aria-label="Main navigation">
          <Link to="/privacy" style={navLinkStyle}>
            Privacy
          </Link>
          <Link to="/terms" style={navLinkStyle}>
            Terms
          </Link>
          <a
            href={APP_URL}
            style={ctaLinkStyle}
            {...createHoverHandlers(
              { background: "var(--milkly-brand-dark)", outline: "2px solid var(--milkly-brand)", outlineOffset: "2px" },
              { background: "var(--milkly-brand)", outline: "", outlineOffset: "" },
            )}
          >
            Sign In
          </a>
        </nav>
      </header>
      <main style={mainStyle}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
