import type { CSSProperties } from "react";

const containerStyle: CSSProperties = {
  maxWidth: "720px",
  margin: "0 auto",
  padding: "3rem 2rem",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2rem",
  fontWeight: 500,
  color: "var(--milkly-fg-primary)",
  margin: "0 0 1rem",
};

const updatedStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-fg-tertiary)",
  margin: "0 0 2rem",
};

const sectionHeadingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-sans)",
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
  margin: "2rem 0 0.75rem",
};

const paragraphStyle: CSSProperties = {
  fontSize: "0.9375rem",
  lineHeight: 1.7,
  color: "var(--milkly-fg-secondary)",
  margin: "0 0 1rem",
};

export function TermsPage(): JSX.Element {
  return (
    <article style={containerStyle}>
      <h1 style={headingStyle}>Terms of Service</h1>
      <p style={updatedStyle}>Last updated: March 2026</p>

      <h2 style={sectionHeadingStyle}>Acceptance of Terms</h2>
      <p style={paragraphStyle}>
        By accessing or using the Milkly platform, you agree to be bound by
        these terms of service. If you do not agree, please do not use the
        platform.
      </p>

      <h2 style={sectionHeadingStyle}>Use of the Service</h2>
      <p style={paragraphStyle}>
        You may use Milkly to create, publish, and distribute newsletter
        content. You are responsible for all content you publish and must comply
        with applicable laws and our content guidelines.
      </p>

      <h2 style={sectionHeadingStyle}>Your Content</h2>
      <p style={paragraphStyle}>
        You retain ownership of the content you create on Milkly. By
        publishing, you grant us a license to host, display, and distribute
        your content through the platform.
      </p>

      <h2 style={sectionHeadingStyle}>Termination</h2>
      <p style={paragraphStyle}>
        We reserve the right to suspend or terminate accounts that violate
        these terms. You may delete your account at any time through your
        account settings.
      </p>

      <h2 style={sectionHeadingStyle}>Contact</h2>
      <p style={paragraphStyle}>
        For questions about these terms, please contact us at
        legal@milkly.xyz.
      </p>
    </article>
  );
}
