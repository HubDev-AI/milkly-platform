import type { CSSProperties } from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.75rem",
  padding: "1.5rem 0",
  fontFamily: "var(--milkly-font-sans)",
};

const buttonBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem 1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "var(--milkly-font-sans)",
  borderRadius: "var(--milkly-radius-md)",
  border: "1px solid var(--milkly-border)",
  background: "var(--milkly-bg-glass)",
  color: "var(--milkly-fg-primary)",
  cursor: "pointer",
  transition: "background 0.15s ease, border-color 0.15s ease",
};

const disabledButtonStyle: CSSProperties = {
  ...buttonBaseStyle,
  opacity: 0.4,
  cursor: "not-allowed",
};

const infoStyle: CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--milkly-fg-secondary)",
  fontVariantNumeric: "tabular-nums",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): JSX.Element | null {
  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav aria-label="Pagination" style={containerStyle}>
      <button
        type="button"
        onClick={() => {
          if (!isFirst) onPageChange(currentPage - 1);
        }}
        disabled={isFirst}
        aria-disabled={isFirst}
        aria-label="Previous page"
        style={isFirst ? disabledButtonStyle : buttonBaseStyle}
      >
        Previous
      </button>
      <span style={infoStyle} aria-live="polite" aria-atomic="true">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => {
          if (!isLast) onPageChange(currentPage + 1);
        }}
        disabled={isLast}
        aria-disabled={isLast}
        aria-label="Next page"
        style={isLast ? disabledButtonStyle : buttonBaseStyle}
      >
        Next
      </button>
    </nav>
  );
}
