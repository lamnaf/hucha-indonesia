import {
  CHART_HEIGHT,
  CHART_PAD_BOTTOM,
  CHART_PAD_TOP,
  CHART_PAD_X,
  CHART_WIDTH,
  type ChartPoint,
} from "./chart-types";

/**
 * Lightweight SVG bar chart (server-rendered, blueprint §28) for categorical
 * counts (e.g. leads per type).
 */
export function AnalyticsBarChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return null;
  }

  const max = Math.max(1, ...data.map((point) => point.value));
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const slotWidth = (CHART_WIDTH - CHART_PAD_X * 2) / data.length;
  const barWidth = Math.min(48, slotWidth * 0.6);

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="Grafik lead per tipe"
    >
      {data.map((point, index) => {
        const x = CHART_PAD_X + index * slotWidth + (slotWidth - barWidth) / 2;
        const barHeight = (point.value / max) * innerHeight;
        const y = CHART_HEIGHT - CHART_PAD_BOTTOM - barHeight;
        return (
          <g key={`${point.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              className="fill-primary/80"
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
            >
              {point.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
