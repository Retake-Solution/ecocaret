"use client";

import Button from "@/components/Button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  variant?: "icon" | "text";
  previousLabel?: string;
  nextLabel?: string;
  showTotalPages?: boolean;
  hideWhenSinglePage?: boolean;
  withTopMargin?: boolean;
  alignment?: "center" | "start";
  className?: string;
}

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function PaginationControls({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
  variant = "icon",
  previousLabel = "Previous",
  nextLabel = "Next",
  showTotalPages = true,
  hideWhenSinglePage = true,
  withTopMargin = true,
  alignment = "center",
  className = "",
}: PaginationControlsProps) {
  if (hideWhenSinglePage && totalPages <= 1) return null;

  const isTextVariant = variant === "text";
  const buttonClassName = isTextVariant
    ? "rounded-xl border border-outline-variant/40 px-6 py-2.5 text-label-sm font-bold text-on-surface hover:bg-surface-container-low hover:border-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    : "flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/10 disabled:opacity-40 transition-all cursor-pointer text-on-surface";
  const pageLabelClassName = isTextVariant
    ? "text-label-sm text-on-surface-variant font-medium"
    : "text-xs font-bold text-on-surface-variant uppercase tracking-widest";

  return (
    <div
      className={joinClasses(
        "flex items-center gap-4",
        alignment === "center" ? "justify-center" : "justify-start",
        withTopMargin && "mt-12",
        className
      )}
    >
      <Button
        unstyled
        disabled={!hasPreviousPage}
        onClick={onPrevious}
        aria-label="Previous page"
        className={buttonClassName}
      >
        {isTextVariant ? (
          previousLabel
        ) : (
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        )}
      </Button>
      <span className={pageLabelClassName}>
        Page {currentPage}
        {showTotalPages ? ` of ${totalPages}` : ""}
      </span>
      <Button
        unstyled
        disabled={!hasNextPage}
        onClick={onNext}
        aria-label="Next page"
        className={buttonClassName}
      >
        {isTextVariant ? (
          nextLabel
        ) : (
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        )}
      </Button>
    </div>
  );
}
