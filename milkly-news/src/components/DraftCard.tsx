import type { CSSProperties } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { Draft } from "milkly-shared/types";
import { formatDate } from "@/lib/format-utils";

export interface DraftCardProps {
  draft: Draft;
  selected: boolean;
  onSelect: (draft: Draft) => void;
}

function contentPreview(mklySource: string, maxLength: number): string {
  const text = DOMPurify.sanitize(mklySource, { ALLOWED_TAGS: [] }).trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

const cardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1.25rem",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  boxShadow: "var(--milkly-shadow-lg)",
  cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
  textAlign: "left",
  width: "100%",
  fontFamily: "inherit",
  fontSize: "inherit",
  color: "inherit",
};

const cardSelectedStyle: CSSProperties = {
  ...cardStyle,
  borderColor: "var(--milkly-brand)",
  boxShadow: "0 0 0 2px var(--milkly-brand), var(--milkly-shadow-lg)",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: "1.125rem",
  fontWeight: 700,
  fontFamily: "var(--milkly-font-serif)",
  color: "var(--milkly-fg-primary)",
  lineHeight: 1.3,
};

const previewStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  lineHeight: 1.55,
  color: "var(--milkly-fg-secondary)",
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "auto",
  paddingTop: "0.5rem",
};

const dateStyle: CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--milkly-fg-secondary)",
};

const badgeStyle: CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  padding: "0.125rem 0.5rem",
  borderRadius: "var(--milkly-radius-md)",
  background: "var(--milkly-brand)",
  color: "#fff",
  marginLeft: "auto",
};

export function DraftCard({ draft, selected, onSelect }: DraftCardProps): JSX.Element {
  const title = draft.title ?? "Untitled Draft";
  const preview = contentPreview(draft.mklySource, 120);
  const editedDate = formatDate(draft.updatedAt);

  return (
    <button
      type="button"
      style={selected ? cardSelectedStyle : cardStyle}
      onClick={() => { onSelect(draft); }}
      aria-pressed={selected}
      aria-label={`Select draft "${title}"`}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px hsla(20 10% 15% / 0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "var(--milkly-shadow-lg)";
        }
      }}
    >
      <h3 style={titleStyle}>{title}</h3>
      {preview.length > 0 && <p style={previewStyle}>{preview}</p>}
      <div style={metaRowStyle}>
        <time dateTime={draft.updatedAt} style={dateStyle}>
          Last edited {editedDate}
        </time>
        {selected && <span style={badgeStyle}>Selected</span>}
      </div>
    </button>
  );
}
