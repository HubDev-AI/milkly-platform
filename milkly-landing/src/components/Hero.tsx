import type { CSSProperties } from "react";
import { APP_URL } from "@/config";
import { createHoverHandlers } from "@/lib/hover-utils";

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "6rem 2rem 4rem",
  maxWidth: "800px",
  margin: "0 auto",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "clamp(2.5rem, 5vw, 4rem)",
  fontWeight: 500,
  lineHeight: 1.15,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 1.5rem",
  letterSpacing: "-0.02em",
};

const accentStyle: CSSProperties = {
  color: "var(--milkly-brand)",
};

const subtextStyle: CSSProperties = {
  fontSize: "1.125rem",
  lineHeight: 1.7,
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 2.5rem",
  maxWidth: "560px",
};

const ctaStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.875rem 2rem",
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

export function Hero(): JSX.Element {
  return (
    <section style={sectionStyle} aria-labelledby="hero-heading">
      <h1 id="hero-heading" style={headingStyle}>
        Your newsletter,{" "}
        <span style={accentStyle}>beautifully crafted</span>
      </h1>
      <p style={subtextStyle}>
        Milkly is the all-in-one platform for creating, publishing, and
        distributing newsletters that your readers will love. Write with a
        beautiful editor, powered by AI.
      </p>
      <a
        href={APP_URL}
        style={ctaStyle}
        {...createHoverHandlers(
          { background: "var(--milkly-brand-dark)", transform: "translateY(-1px)", boxShadow: "var(--milkly-shadow-lg)", outline: "2px solid var(--milkly-brand)", outlineOffset: "2px" },
          { background: "var(--milkly-brand)", transform: "", boxShadow: "var(--milkly-shadow-md)", outline: "", outlineOffset: "" },
        )}
      >
        Start Creating
      </a>
    </section>
  );
}
