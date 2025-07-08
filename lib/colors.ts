// Base color palette (400-500 range for good visibility)
export const CHART_COLORS = [
  "#60a5facc", // blue-400
  "#f87171cc", // red-400
  "#4ade80cc", // green-400
  "#facc15cc", // yellow-400
  "#fb923ccc", // orange-400
  "#a78bfacc", // violet-400
  "#34d399cc", // emerald-400
  "#f472b6cc", // pink-400
  "#818cf8cc", // indigo-400
  "#fbbf24cc", // amber-400
  "#38bdf8cc", // sky-400
  "#a3e635cc", // lime-400
  "#fb7185cc", // rose-400
  "#c084fccc", // purple-400
  "#2dd4bfcc"  // teal-400
];

// Semantic colors with alpha channel for better visibility
export const SEMANTIC_CHART_COLORS = {
    // Primary colors
    primary: "#60a5facc",     // blue-400
    secondary: "#a78bfacc",   // violet-400
    accent: "#34d399cc",      // emerald-400
    
    // Status colors
    success: "#4ade80cc",     // green-400
    danger: "#f87171cc",      // red-400
    warning: "#facc15cc",     // yellow-400
    info: "#38bdf8cc",        // sky-400
    neutral: "#9ca3afcc",     // gray-400
    
    // Additional semantic colors
    processing: "#818cf8cc",  // indigo-400
    completed: "#34d399cc",   // emerald-400
    pending: "#fbbf24cc",     // amber-400
    cancelled: "#f472b6cc",   // pink-400
    refunded: "#c084fccc",    // purple-400
    
    // Default fallback
    default: "#9ca3afcc"      // gray-400
};

// Color variables for CSS-in-JS
export const CHART_COLORS_VARS = {
  blue: "hsl(var(--blue-400))",
  red: "hsl(var(--red-400))",
  green: "hsl(var(--green-400))",
  yellow: "hsl(var(--yellow-400))",
  orange: "hsl(var(--orange-400))",
  violet: "hsl(var(--violet-400))",
  emerald: "hsl(var(--emerald-400))",
  pink: "hsl(var(--pink-400))",
  indigo: "hsl(var(--indigo-400))",
  amber: "hsl(var(--amber-400))",
  sky: "hsl(var(--sky-400))",
  lime: "hsl(var(--lime-400))",
  rose: "hsl(var(--rose-400))",
  purple: "hsl(var(--purple-400))",
  teal: "hsl(var(--teal-400))"
};
