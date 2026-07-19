"use client";

import React from "react";
import Link from "next/link";
import {
  FOOTER_CONTACT_ITEMS,
  FOOTER_LINK_SECTIONS,
  FOOTER_POLICY_NOTES,
  FOOTER_SOCIAL_LINKS,
} from "@/constants/footer";

export default function Footer() {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <div className="grid gap-10 border-b border-inverse-on-surface/12 pb-10 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-[family:var(--font-playfair-display)] text-3xl font-medium text-white">
                Eco Caret
              </p>
              <p className="max-w-md font-body-md text-body-md leading-relaxed text-inverse-on-surface/72">
                Conscious fine jewelry crafted with lab-grown diamonds, recycled
                gold, secure payments, and clear customer policies.
              </p>
            </div>

            <div className="space-y-3">
              {FOOTER_CONTACT_ITEMS.map((item) => {
                const content = (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-inverse-primary" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 font-label-sm text-label-sm text-inverse-on-surface/78 transition-colors hover:text-inverse-primary"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 font-label-sm text-label-sm text-inverse-on-surface/78"
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-primary">
                Follow Us
              </p>
              <div className="grid grid-cols-4 gap-2 sm:max-w-md">
                {FOOTER_SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow Eco Caret on ${social.label}`}
                    className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-inverse-on-surface/12 bg-white/5 px-2 py-3 text-center transition-all hover:border-inverse-primary/60 hover:bg-white/10"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-inverse-primary/15 font-label-sm text-[10px] font-bold tracking-widest text-inverse-primary transition-colors group-hover:bg-inverse-primary group-hover:text-on-primary-fixed"
                      aria-hidden="true"
                    >
                      {social.initials}
                    </span>
                    <span className="min-w-0 max-w-full">
                      <span className="block truncate font-label-sm text-[10px] text-white">
                        {social.label}
                      </span>
                      <span className="hidden truncate font-label-sm text-[10px] text-inverse-on-surface/60 sm:block">
                        {social.handle}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_LINK_SECTIONS.map((section) => (
              <nav key={section.title} aria-label={section.title} className="space-y-4">
                <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-primary">
                  {section.title}
                </p>
                <div className="space-y-3">
                  {section.links.map((link) => (
                    <Link
                      key={`${section.title}-${link.label}`}
                      className="block font-label-sm text-label-sm text-inverse-on-surface/72 transition-colors hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-2">
            {FOOTER_POLICY_NOTES.map((note) => (
              <p key={note} className="font-label-sm text-[11px] leading-relaxed text-inverse-on-surface/64">
                {note}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/terms-and-conditions"
              className="rounded-full border border-inverse-on-surface/20 px-4 py-2 font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-on-surface/78 transition-colors hover:border-inverse-primary hover:text-inverse-primary"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="rounded-full border border-inverse-on-surface/20 px-4 py-2 font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-on-surface/78 transition-colors hover:border-inverse-primary hover:text-inverse-primary"
            >
              Privacy
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-inverse-on-surface/12 pt-6 font-label-sm text-[11px] uppercase tracking-widest text-inverse-on-surface/56 md:flex-row md:items-center md:justify-between">
          <p>(c) 2026 Eco Caret. Handcrafted sustainability.</p>
          <p>Lab-grown diamonds. gold. Thoughtful care.</p>
        </div>
      </div>
    </footer>
  );
}
