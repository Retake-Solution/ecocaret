export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full font-label-md text-label-md font-bold tracking-wider transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3C9984]/30 disabled:opacity-50 disabled:cursor-not-allowed";

export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90 shadow-md",
  secondary: "bg-secondary text-on-secondary hover:shadow-lg",
  outline: "border border-outline-variant text-on-surface hover:bg-surface-container",
  ghost: "text-on-surface-variant hover:text-primary hover:bg-primary/10",
  danger: "bg-error text-white hover:opacity-90 shadow-md",
};

export const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3",
  lg: "px-8 py-4",
};
