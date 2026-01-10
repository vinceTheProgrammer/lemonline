import { createMemo } from "solid-js";

interface XpCurveGraphProps {
  values: number[];
  height?: number;
}

export function XpCurveGraph(props: XpCurveGraphProps) {
  const height = props.height ?? 88; // much smaller
  const paddingX = 6;
  const paddingY = 8;

  const points = createMemo(() => {
    if (props.values.length < 2) return "";

    const min = Math.min(...props.values);
    const max = Math.max(...props.values);
    const range = max - min || 1;

    return props.values
      .map((value, i) => {
        const x =
          paddingX +
          (i / (props.values.length - 1)) *
            (100 - paddingX * 2);

        const y =
          paddingY +
          (1 - (value - min) / range) *
            (height - paddingY * 2);

        return `${x},${y}`;
      })
      .join(" ");
  });

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      class="mb-4 w-full"
      aria-hidden
    >
      {/* Baseline */}
      <line
        x1="0"
        y1={height - paddingY}
        x2="100"
        y2={height - paddingY}
        stroke="currentColor"
        stroke-opacity="0.12"
        stroke-width="1"
      />

      {/* Curve */}
      <polyline
        points={points()}
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        class="text-indigo-400"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  );
}
