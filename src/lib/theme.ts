import type { CSSProperties } from "react";

export const logoColors = [
  { id: "indigo",  label: "Indigo",   bg: "rgba(79,110,247,0.22)",  border: "rgba(79,110,247,0.4)",  glow: "rgba(79,110,247,0.5)",  text: "rgba(100,130,255,0.9)", hex: "#4f6ef7" },
  { id: "violet",  label: "Violet",   bg: "rgba(139,92,246,0.22)",  border: "rgba(139,92,246,0.4)",  glow: "rgba(139,92,246,0.5)",  text: "rgba(167,139,250,0.9)", hex: "#8b5cf6" },
  { id: "cyan",    label: "Cyan",     bg: "rgba(34,211,238,0.18)",  border: "rgba(34,211,238,0.4)",  glow: "rgba(34,211,238,0.5)",  text: "rgba(34,211,238,0.9)",  hex: "#22d3ee" },
  { id: "emerald", label: "Émeraude", bg: "rgba(16,185,129,0.18)",  border: "rgba(16,185,129,0.4)",  glow: "rgba(16,185,129,0.5)",  text: "rgba(16,185,129,0.9)",  hex: "#10b981" },
  { id: "rose",    label: "Rose",     bg: "rgba(244,63,94,0.18)",   border: "rgba(244,63,94,0.4)",   glow: "rgba(244,63,94,0.5)",   text: "rgba(244,63,94,0.9)",   hex: "#f43f5e" },
  { id: "amber",   label: "Ambre",    bg: "rgba(245,158,11,0.18)",  border: "rgba(245,158,11,0.4)",  glow: "rgba(245,158,11,0.5)",  text: "rgba(245,158,11,0.9)",  hex: "#f59e0b" },
  { id: "white",   label: "Blanc",    bg: "rgba(255,255,255,0.1)",  border: "rgba(255,255,255,0.3)", glow: "rgba(255,255,255,0.4)", text: "rgba(255,255,255,0.9)", hex: "#ffffff" },
  { id: "pink",    label: "Pink",     bg: "rgba(236,72,153,0.18)",  border: "rgba(236,72,153,0.4)",  glow: "rgba(236,72,153,0.5)",  text: "rgba(236,72,153,0.9)",  hex: "#ec4899" },
  { id: "orange",  label: "Orange",   bg: "rgba(249,115,22,0.18)",  border: "rgba(249,115,22,0.4)",  glow: "rgba(249,115,22,0.5)",  text: "rgba(249,115,22,0.9)",  hex: "#f97316" },
  { id: "lime",    label: "Lime",     bg: "rgba(132,204,22,0.18)",  border: "rgba(132,204,22,0.4)",  glow: "rgba(132,204,22,0.5)",  text: "rgba(132,204,22,0.9)",  hex: "#84cc16" },
  { id: "teal",    label: "Teal",     bg: "rgba(20,184,166,0.18)",  border: "rgba(20,184,166,0.4)",  glow: "rgba(20,184,166,0.5)",  text: "rgba(20,184,166,0.9)",  hex: "#14b8a6" },
  { id: "gold",    label: "Or",       bg: "rgba(212,175,55,0.18)",  border: "rgba(212,175,55,0.4)",  glow: "rgba(212,175,55,0.5)",  text: "rgba(212,175,55,0.9)",  hex: "#d4af37" },
  { id: "red",     label: "Rouge",    bg: "rgba(239,68,68,0.18)",   border: "rgba(239,68,68,0.4)",   glow: "rgba(239,68,68,0.5)",   text: "rgba(239,68,68,0.9)",   hex: "#ef4444" },
  { id: "sky",     label: "Ciel",     bg: "rgba(14,165,233,0.18)",  border: "rgba(14,165,233,0.4)",  glow: "rgba(14,165,233,0.5)",  text: "rgba(14,165,233,0.9)",  hex: "#0ea5e9" },
];

export type LogoColor = typeof logoColors[0];

export function getThemeColor(): LogoColor {
  try {
    const id = localStorage.getItem("nexus-logo-color") || "indigo";
    return logoColors.find((c) => c.id === id) || logoColors[0];
  } catch {
    return logoColors[0];
  }
}

export interface LogoStyle {
  font: "system" | "serif" | "mono" | "impact" | "italic" | "display";
  effect: "glow" | "outline" | "neon" | "gradient" | "plain" | "hologram";
  shape: "rounded" | "square" | "circle";
}

export const DEFAULT_LOGO_STYLE: LogoStyle = { font: "system", effect: "glow", shape: "rounded" };

export function getLogoStyle(): LogoStyle {
  try {
    return { ...DEFAULT_LOGO_STYLE, ...JSON.parse(localStorage.getItem("nexus-logo-style") || "{}") };
  } catch {
    return DEFAULT_LOGO_STYLE;
  }
}

export function getLetterStyle(color: LogoColor, style: LogoStyle): CSSProperties {
  const fonts: Record<string, CSSProperties> = {
    system:  { fontFamily: "system-ui, -apple-system, sans-serif",              fontWeight: 900, fontStyle: "normal" },
    serif:   { fontFamily: "Georgia, 'Times New Roman', serif",                 fontWeight: 700, fontStyle: "normal" },
    mono:    { fontFamily: "'Courier New', Consolas, 'Liberation Mono', monospace", fontWeight: 700, fontStyle: "normal" },
    impact:  { fontFamily: "Impact, 'Arial Black', sans-serif",                 fontWeight: 400, fontStyle: "normal" },
    italic:  { fontFamily: "system-ui, -apple-system, sans-serif",              fontWeight: 900, fontStyle: "italic" },
    display: { fontFamily: "'Trebuchet MS', Candara, sans-serif",               fontWeight: 700, fontStyle: "normal" },
  };
  const base: CSSProperties = { ...(fonts[style.font] || fonts.system), letterSpacing: "-0.04em" };
  switch (style.effect) {
    case "glow":      return { ...base, color: "#ffffff", textShadow: `0 0 10px ${color.text}, 0 0 20px ${color.glow}` };
    case "outline":   return { ...base, color: "transparent", WebkitTextStroke: `1.5px ${color.hex}` };
    case "neon":      return { ...base, color: color.hex, textShadow: `0 0 4px ${color.hex}, 0 0 10px ${color.hex}, 0 0 22px ${color.glow}` };
    case "gradient":  return { ...base, background: `linear-gradient(135deg, #ffffff 0%, ${color.hex} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
    case "plain":     return { ...base, color: color.text };
    case "hologram":  return { ...base, color: "#ffffff", textShadow: `-1px 0 ${color.hex}, 1px 0 rgba(0,240,255,0.8), 0 0 12px ${color.glow}` };
    default:          return { ...base, color: "#ffffff", textShadow: `0 0 10px ${color.text}, 0 0 20px ${color.glow}` };
  }
}

export function getContainerShape(style: LogoStyle): string {
  switch (style.shape) {
    case "square": return "rounded-sm";
    case "circle": return "rounded-full";
    default:       return "rounded-lg";
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}
