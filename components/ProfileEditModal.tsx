"use client";

import React, { useEffect } from "react";
import Button from "@/components/Button";
import ProfileEditForm from "@/components/ProfileEditForm";
import type { ProfileUser } from "@/lib/features/profile/profileSlice";

interface ProfileEditModalProps {
  isOpen: boolean;
  user: ProfileUser;
  onClose: () => void;
}

export default function ProfileEditModal({ isOpen, user, onClose }: ProfileEditModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-modal-title"
        className="relative z-[1201] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/15 px-5 py-4 md:px-7 md:py-5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              Profile Settings
            </p>
            <h2
              id="edit-profile-modal-title"
              className="font-playfair text-2xl font-semibold text-primary"
            >
              Edit Profile
            </h2>
            <p className="text-sm text-on-surface-variant">
              Update your name, gender, profile image, and saved addresses.
            </p>
          </div>
          <Button
            unstyled
            type="button"
            onClick={onClose}
            aria-label="Close edit profile modal"
            className="material-symbols-outlined rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary cursor-pointer"
          >
            close
          </Button>
        </div>
        <div className="max-h-[calc(90vh-116px)] overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          <ProfileEditForm
            user={user}
            onCancel={onClose}
            onSuccess={onClose}
            showIntro={false}
            className="space-y-8"
          />
        </div>
      </section>
    </div>
  );
}
