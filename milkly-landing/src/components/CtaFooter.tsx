import type { CSSProperties } from "react";
import { APP_URL } from "@/config";
import { createHoverHandlers } from "@/lib/hover-utils";

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "1.5rem",
  padding: "5rem 2rem",
  background: "var(--milkly-bg-secondary)",
  borderTop: "1px solid var(--milkly-border-subtle)",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
  fontWeight: 500,
  lineHeight: 1.2,
  color: "var(--milkly-fg-primary)",
  margin: 0,
};

const subtextStyle: CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.7,
  color: "var(--milkly-fg-secondary)",
  margin: 0,
  maxWidth: "440px",
};

const ctaStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.875rem 2.5rem",
  fontSize: "1rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  borderRadius: "var(--milkly-radius-lg)",
  background: "var(--milkly-brand)",
  color: "#fff",
  textDecoration: "none",
  boxShadow: "var(--milkly-shadow-md)",
  transition: "background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
};

export function CtaFooter(): JSX.Element {
  return (
    <section style={sectionStyle} aria-labelledby="cta-footer-heading">
      <h2 id="cta-footer-heading" style={headingStyle}>
        Ready to start writing?
      </h2>
      <p style={subtextStyle}>
        Join Milkly for free and publish your first newsletter in minutes.
      </p>
      <a
        href={APP_URL}
        style={ctaStyle}
        {...createHoverHandlers(
          { background: "var(--milkly-brand-dark)", transform: "translateY(-1px)", boxShadow: "var(--milkly-shadow-lg)", outline: "2px solid var(--milkly-brand)", outlineOffset: "2px" },
          { background: "var(--milkly-brand)", transform: "", boxShadow: "var(--milkly-shadow-md)", outline: "", outlineOffset: "" },
        )}
      >
        Get Started Free
      </a>
    </section>
  );
}
