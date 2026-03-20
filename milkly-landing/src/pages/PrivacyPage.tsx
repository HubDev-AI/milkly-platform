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

export function PrivacyPage(): JSX.Element {
  return (
    <article style={containerStyle}>
      <h1 style={headingStyle}>Privacy Policy</h1>
      <p style={updatedStyle}>Last updated: March 2026</p>

      <h2 style={sectionHeadingStyle}>Information We Collect</h2>
      <p style={paragraphStyle}>
        When you create an account, we collect your email address and display
        name. We also collect usage data such as pages visited and features used
        to improve the platform experience.
      </p>

      <h2 style={sectionHeadingStyle}>How We Use Your Information</h2>
      <p style={paragraphStyle}>
        We use your information to provide and improve the Milkly platform,
        send newsletters you have subscribed to, and communicate important
        updates about your account or our services.
      </p>

      <h2 style={sectionHeadingStyle}>Data Sharing</h2>
      <p style={paragraphStyle}>
        We do not sell your personal information. We may share data with service
        providers who help us operate the platform, such as email delivery and
        hosting infrastructure.
      </p>

      <h2 style={sectionHeadingStyle}>Contact</h2>
      <p style={paragraphStyle}>
        If you have questions about this privacy policy, please contact us at
        privacy@milkly.xyz.
      </p>
    </article>
  );
}
