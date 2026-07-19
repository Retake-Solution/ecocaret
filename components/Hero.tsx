"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  HERO_BACKGROUND_IMAGES,
  HERO_SPOTLIGHTS,
  HERO_TRUST_SIGNALS,
} from "@/constants/hero";

const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_CONFIDENCE_THRESHOLD = 8000;

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [backgroundDirection, setBackgroundDirection] = useState(1);
  const activeSpotlight = HERO_SPOTLIGHTS[spotlightIndex];
  const activeBackground = HERO_BACKGROUND_IMAGES[backgroundIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSpotlightIndex((current) => (current + 1) % HERO_SPOTLIGHTS.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const getWrappedBackgroundIndex = (index: number) =>
    (index + HERO_BACKGROUND_IMAGES.length) % HERO_BACKGROUND_IMAGES.length;

  const changeBackground = (direction: number) => {
    setBackgroundDirection(direction);
    setBackgroundIndex((current) => getWrappedBackgroundIndex(current + direction));
  };

  const handleBackgroundDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const swipeConfidence = Math.abs(info.offset.x) * info.velocity.x;

    if (info.offset.x <= -SWIPE_DISTANCE_THRESHOLD || swipeConfidence <= -SWIPE_CONFIDENCE_THRESHOLD) {
      changeBackground(1);
      return;
    }

    if (info.offset.x >= SWIPE_DISTANCE_THRESHOLD || swipeConfidence >= SWIPE_CONFIDENCE_THRESHOLD) {
      changeBackground(-1);
    }
  };

  return (
    <section className="relative isolate hidden min-h-[680px] overflow-hidden bg-surface px-margin-mobile pt-28 pb-10 md:block md:min-h-[720px] md:px-margin-desktop md:pt-32 md:pb-14">
      <motion.div
        className="absolute inset-0 z-0 cursor-grab touch-pan-y active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={handleBackgroundDragEnd}
      >
        <AnimatePresence custom={backgroundDirection} initial={false}>
          <motion.img
            key={activeBackground.src}
            alt={activeBackground.alt}
            src={activeBackground.src}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-[64%_center]"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: backgroundDirection > 0 ? 72 : -72, scale: 1.04 }
            }
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: backgroundDirection > 0 ? -72 : 72, scale: 1.02 }
            }
            transition={{ duration: shouldReduceMotion ? 0.2 : 0.68, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/92 to-surface/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/25 to-transparent" />
      </motion.div>

      <div className="relative z-10 mx-auto flex min-h-[542px] w-full max-w-container-max flex-col justify-between gap-10 md:min-h-[560px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="max-w-2xl space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-surface-container-lowest/80 px-4 py-2 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                Conscious Luxury, Made Personal
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="font-[family:var(--font-playfair-display)] text-4xl font-medium leading-[1.08] tracking-tight text-on-surface sm:text-5xl lg:text-6xl">
                Fine jewelry with a lighter footprint.
              </h1>
              <p className="max-w-xl font-body-lg text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
                Discover lab-grown diamond pieces crafted in recycled gold, made
                for modern rituals, daily elegance, and heirloom-level meaning.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md font-bold tracking-wider text-on-primary shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 active:translate-y-0"
              >
                Explore Collections
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/our-story"
                className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-surface-container-lowest/70 px-8 py-4 font-label-md text-label-md font-bold tracking-wider text-primary backdrop-blur-md transition-all hover:border-primary hover:bg-primary/10"
              >
                Our Philosophy
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {HERO_TRUST_SIGNALS.map((signal) => (
                <div
                  key={signal.label}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest/70 px-3 py-2 text-on-surface-variant backdrop-blur-md"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
                    {signal.icon}
                  </span>
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                    {signal.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block">
            <div className="ml-auto max-w-sm rounded-lg border border-white/70 bg-surface-container-lowest/78 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <p className="font-label-sm text-[10px] font-bold uppercase tracking-widest text-primary">
                    {activeSpotlight.eyebrow}
                  </p>
                  <h2 className="mt-1 font-headline-sm text-headline-sm text-on-surface">
                    {activeSpotlight.title}
                  </h2>
                </div>
                <span className="material-symbols-outlined rounded-full bg-primary/10 p-3 text-primary" aria-hidden="true">
                  {activeSpotlight.icon}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {activeSpotlight.description}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
