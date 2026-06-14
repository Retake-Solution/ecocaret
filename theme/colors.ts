/**
 * Eco Caret Design System Colors
 * 
 * This file centralizes all theme and custom colors used throughout the application
 * to ensure styling consistency and support both CSS custom properties and JS-based style variables.
 */

export const THEME_COLORS = {
  // Global Eco Caret Brand Colors (Atelier Theme)
  global: {
    primary: "#894d0d",
    "on-primary": "#ffffff",
    "primary-container": "#a76526",
    "on-primary-container": "#fffbff",

    secondary: "#8b4e39",
    "on-secondary": "#ffffff",
    "secondary-container": "#fdae93",
    "on-secondary-container": "#783f2b",

    tertiary: "#655b47",
    "on-tertiary": "#ffffff",
    "tertiary-container": "#7f735f",
    "on-tertiary-container": "#fffbff",

    error: "#ba1a1a",
    "on-error": "#ffffff",
    "error-container": "#ffdad6",
    "on-error-container": "#93000a",

    background: "#fff8f4",
    "on-background": "#231a11",

    surface: "#fff8f4",
    "on-surface": "#231a11",
    "surface-variant": "#f1dfd1",
    "on-surface-variant": "#524439",

    "surface-dim": "#e8d7c9",
    "surface-bright": "#fff8f4",
    "surface-container-lowest": "#ffffff",
    "surface-container-low": "#fff1e7",
    "surface-container": "#fdebdc",
    "surface-container-high": "#f7e5d7",
    "surface-container-highest": "#f1dfd1",
    "surface-tint": "#8c4f10",

    outline: "#857467",
    "outline-variant": "#d8c3b4",

    "inverse-surface": "#392f25",
    "inverse-on-surface": "#ffeee0",
    "inverse-primary": "#ffb77b",

    // Fixed Color Variants
    "primary-fixed": "#ffdcc2",
    "primary-fixed-dim": "#ffb77b",
    "on-primary-fixed": "#2e1500",
    "on-primary-fixed-variant": "#6d3a00",

    "secondary-fixed": "#ffdbcf",
    "secondary-fixed-dim": "#ffb59c",
    "on-secondary-fixed": "#370e01",
    "on-secondary-fixed-variant": "#6e3824",

    "tertiary-fixed": "#f0e0c8",
    "tertiary-fixed-dim": "#d3c5ad",
    "on-tertiary-fixed": "#221b0b",
    "on-tertiary-fixed-variant": "#4f4533",
  },

  // Collections Page Specific Colors (Tonal Gold Theme)
  collections: {
    primary: "#735c00",
    secondary: "#685e31",
    background: "#fff8f2",
    surface: "#fff8f2",
    "surface-container": "#f6eddf",
    "surface-container-low": "#fcf2e5",
    "surface-container-high": "#f0e7da",
    "surface-container-highest": "#ebe1d4",
    "surface-container-lowest": "#ffffff",
    "on-surface": "#1f1b13",
    "on-surface-variant": "#4d4635",
    outline: "#7f7663",
    "outline-variant": "#d0c5af",
    "primary-container": "#d4af37",
    "on-primary-container": "#554300",
    "secondary-container": "#f1e3a9",
    "on-secondary-container": "#6e6436",
  },

  // Accents and Metallic Materials
  accents: {
    copper: "#b87333",       // Used in card borders and luxury lines
    platinum: "#e5e4e2",     // Bespoke ring visualizer metal
    roseGold: "#e6a08a",     // Bespoke ring visualizer metal
    yellowGold: "#ffd700",   // Bespoke ring visualizer metal
  }
} as const;

export default THEME_COLORS;
