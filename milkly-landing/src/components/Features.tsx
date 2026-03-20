import type { CSSProperties } from "react";
import { Sparkles, ShieldCheck, BarChart3 } from "lucide-react";
import { createHoverHandlers } from "@/lib/hover-utils";

const sectionStyle: CSSProperties = {
  padding: "4rem 2rem",
  maxWidth: "1000px",
  margin: "0 auto",
};

const headingStyle: CSSProperties = {
  fontFamily: "var(--milkly-font-serif)",
  fontSize: "2rem",
  fontWeight: 500,
  textAlign: "center",
  color: "var(--milkly-fg-primary)",
  margin: "0 0 3rem",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "2rem",
};

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.5rem",
  borderRadius: "var(--milkly-radius-lg)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-secondary)",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

const iconStyle: CSSProperties = {
  color: "var(--milkly-brand)",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.0625rem",
  fontWeight: 700,
  color: "var(--milkly-fg-primary)",
};

const cardDescStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "var(--milkly-fg-secondary)",
};

interface FeatureData {
  icon: typeof Sparkles;
  title: string;
  description: string;
}

const features: readonly FeatureData[] = [
  {
    icon: Sparkles,
    title: "AI-powered writing",
    description:
      "Generate outlines, rewrite paragraphs, and polish your prose with built-in AI assistance.",
  },
  {
    icon: ShieldCheck,
    title: "Seamless single sign-on",
    description:
      "Log in once and access every Milkly portal. Cross-domain SSO keeps your experience frictionless.",
  },
  {
    icon: BarChart3,
    title: "Email distribution",
    description:
      "Deliver newsletters straight to your subscribers' inboxes and track engagement in real time.",
  },
] as const;

const cardHoverHandlers = createHoverHandlers(
  { transform: "translateY(-2px)", boxShadow: "var(--milkly-shadow-md)" },
  { transform: "", boxShadow: "none" },
);

export function Features(): JSX.Element {
  return (
    <section style={sectionStyle} aria-labelledby="features-heading">
      <h2 id="features-heading" style={headingStyle}>
        Why Milkly
      </h2>
      <div style={gridStyle}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              style={cardStyle}
              {...cardHoverHandlers}
            >
              <Icon size={22} strokeWidth={1.75} style={iconStyle} aria-hidden="true" />
              <h3 style={cardTitleStyle}>{feature.title}</h3>
              <p style={cardDescStyle}>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
