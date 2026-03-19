import type { CSSProperties } from "react";

export interface LoadingSkeletonProps {
  width?: string | undefined;
  height?: string | undefined;
  borderRadius?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const SHIMMER_KEYFRAMES = `
@keyframes milkly-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

export function LoadingSkeleton({
  width = "100%",
  height = "1rem",
  borderRadius,
  className,
  style,
}: LoadingSkeletonProps): JSX.Element {
  const skeletonStyle: CSSProperties = {
    display: "block",
    width,
    height,
    borderRadius: borderRadius ?? "var(--milkly-radius-md)",
    background:
      "linear-gradient(90deg, hsl(40 25% 92%) 25%, hsl(40 33% 97%) 50%, hsl(40 25% 92%) 75%)",
    backgroundSize: "200% 100%",
    animation: "milkly-shimmer 1.5s ease-in-out infinite",
    ...style,
  };

  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <span
        role="status"
        aria-label="Loading…"
        aria-busy="true"
        className={className}
        style={skeletonStyle}
      />
    </>
  );
}
