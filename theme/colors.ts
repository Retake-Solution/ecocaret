/**
 * Eco Caret Design System Colors
 * 
 * This file centralizes all theme and custom colors used throughout the application
 * to ensure styling consistency and support both CSS custom properties and JS-based style variables.
 */

export const THEME_COLORS = {
  // Global Eco Caret Brand Colors (Teal Theme)
  global: {
    primary: "#3C9984",
    "on-primary": "#ffffff",
    "primary-container": "#2f7d6c",
    "on-primary-container": "#f4fffb",

    secondary: "#2f6f73",
    "on-secondary": "#ffffff",
    "secondary-container": "#bdebe2",
    "on-secondary-container": "#0f4c40",

    tertiary: "#526e68",
    "on-tertiary": "#ffffff",
    "tertiary-container": "#6f8f87",
    "on-tertiary-container": "#f4fffb",

    error: "#ba1a1a",
    "on-error": "#ffffff",
    "error-container": "#ffdad6",
    "on-error-container": "#93000a",

    background: "#f7fffc",
    "on-background": "#10201c",

    surface: "#f7fffc",
    "on-surface": "#10201c",
    "surface-variant": "#d9eee8",
    "on-surface-variant": "#3f514c",

    "surface-dim": "#d7ebe5",
    "surface-bright": "#f7fffc",
    "surface-container-lowest": "#ffffff",
    "surface-container-low": "#effbf7",
    "surface-container": "#e7f6f1",
    "surface-container-high": "#def0ea",
    "surface-container-highest": "#d6e9e3",
    "surface-tint": "#3C9984",

    outline: "#6d807a",
    "outline-variant": "#bdd3cc",

    "inverse-surface": "#263733",
    "inverse-on-surface": "#e8f7f2",
    "inverse-primary": "#88d8c7",

    // Fixed Color Variants
    "primary-fixed": "#d6f4ed",
    "primary-fixed-dim": "#8ed8c8",
    "on-primary-fixed": "#002019",
    "on-primary-fixed-variant": "#1f6f5f",

    "secondary-fixed": "#d0f0eb",
    "secondary-fixed-dim": "#9bd5cf",
    "on-secondary-fixed": "#002023",
    "on-secondary-fixed-variant": "#1d5b5f",

    "tertiary-fixed": "#dcefeb",
    "tertiary-fixed-dim": "#b7d3cd",
    "on-tertiary-fixed": "#10201c",
    "on-tertiary-fixed-variant": "#3c5f58",
  },

  // Collections Page Specific Colors (Tonal Teal Theme)
  collections: {
    primary: "#3C9984",
    secondary: "#2f6f73",
    background: "#f7fffc",
    surface: "#f7fffc",
    "surface-container": "#e7f6f1",
    "surface-container-low": "#effbf7",
    "surface-container-high": "#def0ea",
    "surface-container-highest": "#d6e9e3",
    "surface-container-lowest": "#ffffff",
    "on-surface": "#10201c",
    "on-surface-variant": "#3f514c",
    outline: "#6d807a",
    "outline-variant": "#bdd3cc",
    "primary-container": "#d6f4ed",
    "on-primary-container": "#1f6f5f",
    "secondary-container": "#bdebe2",
    "on-secondary-container": "#0f4c40",
  },

  // Accents and Metallic Materials
  accents: {
    copper: "#3C9984",       // Used in card borders and luxury lines
    platinum: "#e5e4e2",     // Bespoke ring visualizer metal
    roseGold: "#e6a08a",     // Bespoke ring visualizer metal
    yellowGold: "#ffd700",   // Bespoke ring visualizer metal
  }
} as const;

export default THEME_COLORS;
