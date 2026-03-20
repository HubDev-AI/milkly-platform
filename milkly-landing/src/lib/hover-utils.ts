import type React from "react";

export function createHoverHandlers(
  hoverStyle: Record<string, string>,
  normalStyle: Record<string, string>,
) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, hoverStyle);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, normalStyle);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, hoverStyle);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      Object.assign(e.currentTarget.style, normalStyle);
    },
  };
}
