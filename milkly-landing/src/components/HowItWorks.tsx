import type { CSSProperties } from "react";
import { PenLine, Globe, Mail } from "lucide-react";

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
  alignItems: "center",
  textAlign: "center",
  gap: "1rem",
  padding: "2rem 1.5rem",
  borderRadius: "var(--milkly-radius-lg)",
  border: "var(--milkly-glass-border)",
  background: "var(--milkly-glass-bg)",
  backdropFilter: `blur(var(--milkly-glass-blur))`,
  WebkitBackdropFilter: `blur(var(--milkly-glass-blur))`,
  boxShadow: "var(--milkly-shadow-sm)",
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

const iconWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-bg-secondary)",
  color: "var(--milkly-brand)",
};

const stepLabelStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--milkly-brand)",
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.25rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
};

const cardDescStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  lineHeight: 1.6,
  color: "var(--milkly-fg-secondary)",
};

interface StepData {
  icon: typeof PenLine;
  label: string;
  title: string;
  description: string;
}

const steps: readonly StepData[] = [
  {
    icon: PenLine,
    label: "Step 1",
    title: "Create",
    description:
      "Write your newsletter in a rich editor with auto-save, drafts, and AI-powered assistance.",
  },
  {
    icon: Globe,
    label: "Step 2",
    title: "Publish",
    description:
      "Publish to your personal page on milkly.news. Your readers get a beautiful, shareable link.",
  },
  {
    icon: Mail,
    label: "Step 3",
    title: "Distribute",
    description:
      "Send to your subscribers via milkly.email. Track opens, clicks, and grow your audience.",
  },
] as const;

function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>): void {
  const el = e.currentTarget;
  el.style.transform = "translateY(-4px)";
  el.style.boxShadow = "var(--milkly-shadow-lg)";
}

function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>): void {
  const el = e.currentTarget;
  el.style.transform = "";
  el.style.boxShadow = "var(--milkly-shadow-sm)";
}

export function HowItWorks(): JSX.Element {
  return (
    <section style={sectionStyle} aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading" style={headingStyle}>
        How It Works
      </h2>
      <div style={gridStyle}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              style={cardStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div style={iconWrapStyle} aria-hidden="true">
                <Icon size={24} strokeWidth={1.75} />
              </div>
              <span style={stepLabelStyle}>{step.label}</span>
              <h3 style={cardTitleStyle}>{step.title}</h3>
              <p style={cardDescStyle}>{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
