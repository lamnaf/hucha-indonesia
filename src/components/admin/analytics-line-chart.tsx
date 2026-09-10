import {
  CHART_HEIGHT,
  CHART_PAD_BOTTOM,
  CHART_PAD_TOP,
  CHART_PAD_X,
  CHART_WIDTH,
  type ChartPoint,
} from "./chart-types";

/**
 * Lightweight SVG line chart (server-rendered, blueprint §28) used by the
 * analytics dashboard. No charting dependency required; renders a polyline
 * with a baseline grid and first/last axis labels.
 */
export function AnalyticsLineChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return null;
  }

  const max = Math.max(1, ...data.map((point) => point.value));
  const innerWidth = CHART_WIDTH - CHART_PAD_X * 2;
  const innerHeight = CHART_HEIGHT - CHART_PAD_TOP - CHART_PAD_BOTTOM;
  const stepX = innerWidth / Math.max(1, data.length - 1);

  const points = data.map((point, index) => {
    const x = CHART_PAD_X + index * stepX;
    const y =
      CHART_HEIGHT - CHART_PAD_BOTTOM - (point.value / max) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const gridLines = [0, 0.5, 1].map((ratio) => {
    const y = CHART_HEIGHT - CHART_PAD_BOTTOM - ratio * innerHeight;
    return { y, value: Math.round(max * ratio) };
  });

  const firstLabel = points[0];
  const lastLabel = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label="Grafik kunjungan halaman harian"
    >
      {gridLines.map((line) => (
        <g key={line.y}>
          <line
            x1={CHART_PAD_X}
            x2={CHART_WIDTH - CHART_PAD_X}
            y1={line.y}
            y2={line.y}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={6}
            y={line.y + 4}
            className="fill-muted-foreground text-[10px]"
          >
            {line.value}
          </text>
        </g>
      ))}
      <path
        d={linePath}
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point) => (
        <circle
          key={`${point.label}-${point.x}`}
          cx={point.x}
          cy={point.y}
          r="3"
          className="fill-primary"
        />
      ))}
      <text
        x={firstLabel.x}
        y={CHART_HEIGHT - 8}
        className="fill-muted-foreground text-[10px]"
      >
        {firstLabel.label}
      </text>
      <text
        x={lastLabel.x}
        y={CHART_HEIGHT - 8}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        {lastLabel.label}
      </text>
    </svg>
  );
}
