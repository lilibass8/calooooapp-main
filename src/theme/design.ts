export const colors = {
  background: "#f6efe5",
  backgroundAlt: "#fffaf4",
  surface: "#fffdf9",
  surfaceMuted: "#f4e6d4",
  surfaceStrong: "#1f4d44",
  primary: "#1f6f5f",
  primaryStrong: "#164c42",
  accent: "#ea9d55",
  accentSoft: "#f8e4cf",
  text: "#17312b",
  textMuted: "#6f756c",
  textSoft: "#8c8f86",
  border: "#eadfce",
  danger: "#b9553f",
  success: "#2b7a63",
  white: "#ffffff"
} as const;

export const radii = {
  sm: 14,
  md: 20,
  lg: 28,
  pill: 999
} as const;

export const shadows = {
  card: "0 14px 30px rgba(86, 63, 34, 0.10)",
  soft: "0 8px 18px rgba(86, 63, 34, 0.08)",
  strong: "0 18px 36px rgba(31, 77, 68, 0.18)"
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;
