/**
 * Shared types and geometry for the server-rendered analytics charts
 * (blueprint §28). Kept dependency-free; the chart components render pure SVG.
 */
export interface ChartPoint {
  label: string;
  value: number;
}

export const CHART_WIDTH = 600;
export const CHART_HEIGHT = 220;
export const CHART_PAD_X = 48;
export const CHART_PAD_TOP = 16;
export const CHART_PAD_BOTTOM = 30;
