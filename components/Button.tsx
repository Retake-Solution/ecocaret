"use client";

import React from "react";
import {
  BUTTON_BASE_CLASSES,
  BUTTON_SIZE_CLASSES,
  BUTTON_VARIANT_CLASSES,
  type ButtonSize,
  type ButtonVariant,
} from "@/constants/button";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  leftIcon?: string;
  rightIcon?: string;
  unstyled?: boolean;
}

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function Button({
  children,
  className,
  disabled,
  fullWidth = false,
  isLoading = false,
  leftIcon,
  loadingLabel,
  rightIcon,
  size = "md",
  type = "button",
  unstyled = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  if (unstyled) {
    return (
      <button type={type} disabled={isDisabled} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={joinClasses(
        BUTTON_BASE_CLASSES,
        BUTTON_VARIANT_CLASSES[variant],
        BUTTON_SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
      ) : leftIcon ? (
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span>{isLoading && loadingLabel ? loadingLabel : children}</span>
      {!isLoading && rightIcon && (
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
