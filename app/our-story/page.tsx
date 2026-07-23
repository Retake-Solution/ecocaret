"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Button from "@/components/Button";
import {
  OUR_STORY_CHAPTERS,
  OUR_STORY_COMMITMENTS,
  OUR_STORY_HERO_IMAGE,
  OUR_STORY_HERO_METRICS,
  OUR_STORY_PROCESS_STEPS,
  OUR_STORY_TIMELINE,
} from "@/constants/ourStory";

const revealViewport = { once: true, amount: 0.24 };

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.09,
    },
  },
} satisfies Variants;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
} satisfies Variants;

const imageReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.72, ease: "easeOut" },
  },
} satisfies Variants;

const joinClasses = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function OurStoryPage() {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
    window.setTimeout(() => setSubscribed(false), 4000);
  };

  const revealInitial = shouldReduceMotion ? false : "hidden";
  const hoverLift = shouldReduceMotion ? undefined : { y: -6 };
  const hoverPress = shouldReduceMotion ? undefined : { scale: 0.98 };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      <main className="flex-grow">
        <section className="relative isolate overflow-hidden bg-surface px-margin-mobile pt-28 pb-12 md:px-margin-desktop md:pt-36 md:pb-20">
          <div className="absolute inset-0 -z-10">
            <motion.img
              alt="Macro close-up of a diamond"
              src={OUR_STORY_HERO_IMAGE}
              className="h-full w-full object-cover object-[64%_center]"
              initial={shouldReduceMotion ? false : { scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/88 to-surface/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
          </div>

          <motion.div
            className="mx-auto grid min-h-[610px] max-w-container-max gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end"
            initial={revealInitial}
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className="max-w-3xl space-y-7" variants={fadeUp}>
              <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-surface-container-lowest/78 px-4 py-2 shadow-sm backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                  Our Story
                </span>
              </div>

              <div className="space-y-5">
                <h1 className="font-[family:var(--font-playfair-display)] text-4xl font-medium leading-[1.08] text-on-surface sm:text-5xl lg:text-7xl">
                  Conscious luxury, shaped with science and human care.
                </h1>
                <p className="max-w-2xl font-body-lg text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
                  Eco Caret began with a simple belief: beautiful jewelry can feel
                  intimate, enduring, and transparent without relying on hidden origins.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <motion.div whileHover={hoverLift} whileTap={hoverPress}>
                  <Link
                    href="/collections"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-label-md text-label-md font-bold tracking-wider text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container sm:w-auto"
                  >
                    Explore Collections
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </motion.div>
                <motion.div whileHover={hoverLift} whileTap={hoverPress}>
                  <Link
                    href="#craft"
                    className="inline-flex w-full items-center justify-center rounded-full border border-primary/30 bg-surface-container-lowest/70 px-8 py-4 font-label-md text-label-md font-bold tracking-wider text-primary backdrop-blur-md transition-colors hover:border-primary hover:bg-primary/10 sm:w-auto"
                  >
                    See The Craft
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest/78 p-4 shadow-xl shadow-primary/10 backdrop-blur-md"
              variants={fadeUp}
            >
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                What guides every piece
              </p>
              <div className="mt-5 grid gap-3">
                {OUR_STORY_HERO_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-outline-variant/25 bg-surface-container-low p-4"
                  >
                    <p className="font-headline-sm text-2xl text-on-surface">
                      {metric.value}
                    </p>
                    <p className="mt-1 font-label-sm text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="bg-surface px-margin-mobile py-16 md:px-margin-desktop md:py-24">
          <motion.div
            className="mx-auto max-w-container-max"
            initial={revealInitial}
            whileInView="visible"
            viewport={revealViewport}
            variants={staggerContainer}
          >
            <motion.div className="max-w-3xl space-y-4" variants={fadeUp}>
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                A Different Starting Point
              </p>
              <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-on-surface md:text-5xl">
                We design around proof, restraint, and the feeling of keeping something well.
              </h2>
            </motion.div>

            <motion.div className="mt-10 grid gap-4 md:grid-cols-3" variants={staggerContainer}>
              {OUR_STORY_TIMELINE.map((item) => (
                <motion.article
                  key={item.title}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
                  variants={fadeUp}
                  whileHover={hoverLift}
                >
                  <p className="font-[family:var(--font-playfair-display)] text-5xl text-primary/35">
                    {item.year}
                  </p>
                  <h3 className="mt-5 font-headline-sm text-2xl text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {OUR_STORY_CHAPTERS.map((chapter, index) => {
          const isReversed = index % 2 === 1;

          return (
            <section
              key={chapter.title}
              id={index === 1 ? "craft" : undefined}
              className={joinClasses(
                "px-margin-mobile py-16 md:px-margin-desktop md:py-24",
                isReversed ? "bg-surface-container-low" : "bg-background"
              )}
            >
              <motion.div
                className="mx-auto grid max-w-container-max gap-10 lg:grid-cols-12 lg:items-center"
                initial={revealInitial}
                whileInView="visible"
                viewport={revealViewport}
                variants={staggerContainer}
              >
                <motion.div
                  className={joinClasses(
                    "lg:col-span-6",
                    isReversed ? "lg:col-start-7" : "lg:col-start-1"
                  )}
                  variants={fadeUp}
                >
                  <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                    {chapter.eyebrow}
                  </p>
                  <h2 className="mt-4 font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-on-surface md:text-5xl">
                    {chapter.title}
                  </h2>
                  <p className="mt-5 max-w-xl font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {chapter.description}
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {chapter.stats.map((stat) => (
                      <motion.div
                        key={stat.label}
                        className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm"
                        whileHover={hoverLift}
                      >
                        <p className="font-headline-sm text-3xl text-primary">
                          {stat.value}
                        </p>
                        <p className="mt-1 font-label-sm text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className={joinClasses(
                    "lg:col-span-5",
                    isReversed ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-8"
                  )}
                  variants={imageReveal}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container shadow-xl shadow-primary/10"
                    whileHover={shouldReduceMotion ? undefined : { y: -5, rotate: isReversed ? -1 : 1 }}
                  >
                    <img
                      alt={chapter.alt}
                      src={chapter.image}
                      className="aspect-[4/5] h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-on-surface/45 to-transparent" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </section>
          );
        })}

        <section className="relative overflow-hidden bg-inverse-surface px-margin-mobile py-16 text-inverse-on-surface md:px-margin-desktop md:py-24">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <motion.div
            className="relative mx-auto max-w-container-max"
            initial={revealInitial}
            whileInView="visible"
            viewport={revealViewport}
            variants={staggerContainer}
          >
            <motion.div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end" variants={fadeUp}>
              <div className="space-y-4">
                <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-primary">
                  From Lab To Keepsake
                </p>
                <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-white md:text-5xl">
                  Our process is intentionally readable.
                </h2>
              </div>
              <p className="font-body-md text-body-md leading-relaxed text-inverse-on-surface/76">
                Each step is designed to make the material story visible, from the
                origin of the diamond to the final polish and product record.
              </p>
            </motion.div>

            <motion.div className="mt-12 grid gap-4 md:grid-cols-4" variants={staggerContainer}>
              {OUR_STORY_PROCESS_STEPS.map((step) => (
                <motion.article
                  key={step.title}
                  className="rounded-lg border border-inverse-on-surface/14 bg-white/[0.04] p-5 backdrop-blur-sm"
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { y: -5, backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <span className="material-symbols-outlined text-3xl text-inverse-primary" aria-hidden="true">
                    {step.icon}
                  </span>
                  <h3 className="mt-6 font-headline-sm text-2xl text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 font-body-md text-sm leading-relaxed text-inverse-on-surface/72">
                    {step.description}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section className="bg-surface-container px-margin-mobile py-16 md:px-margin-desktop md:py-24">
          <motion.div
            className="mx-auto max-w-container-max"
            initial={revealInitial}
            whileInView="visible"
            viewport={revealViewport}
            variants={staggerContainer}
          >
            <motion.div className="mb-10 max-w-2xl space-y-3" variants={fadeUp}>
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                The Commitment
              </p>
              <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-on-surface md:text-5xl">
                Standards that customers can actually understand.
              </h2>
            </motion.div>

            <motion.div className="grid gap-4 md:grid-cols-3" variants={staggerContainer}>
              {OUR_STORY_COMMITMENTS.map((item) => (
                <motion.article
                  key={item.title}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
                  variants={fadeUp}
                  whileHover={hoverLift}
                >
                  <span className="material-symbols-outlined rounded-full bg-primary/10 p-3 text-3xl text-primary" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className="mt-6 font-headline-sm text-2xl text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section className="bg-primary px-margin-mobile py-14 text-on-primary md:px-margin-desktop md:py-20">
          <motion.div
            className="mx-auto grid max-w-container-max gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
            initial={revealInitial}
            whileInView="visible"
            viewport={revealViewport}
            variants={staggerContainer}
          >
            <motion.div className="space-y-4" variants={fadeUp}>
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-primary/75">
                Stay Close
              </p>
              <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight md:text-5xl">
                New drops, care notes, and material stories.
              </h2>
              <p className="font-body-md text-body-md leading-relaxed text-on-primary/78">
                Join our list for thoughtful updates from the Eco Caret studio.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubscribe}
              className="rounded-lg border border-white/25 bg-white/10 p-3 backdrop-blur-md sm:flex sm:items-center sm:gap-3"
              variants={fadeUp}
            >
              <label className="sr-only" htmlFor="story-newsletter-email">
                Email address
              </label>
              <input
                id="story-newsletter-email"
                className="w-full rounded-lg border border-white/25 bg-white px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-white focus:ring-4 focus:ring-white/20 sm:flex-1"
                placeholder="Email address"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <motion.div whileTap={hoverPress} className="mt-3 sm:mt-0">
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full bg-on-primary text-primary hover:bg-surface sm:w-auto"
                  rightIcon="arrow_forward"
                >
                  Subscribe
                </Button>
              </motion.div>
            </motion.form>

            <AnimatePresence>
              {subscribed && (
                <motion.div
                  className="rounded-full bg-on-primary px-5 py-3 text-center font-label-sm text-[12px] font-bold uppercase tracking-wider text-primary shadow-md lg:col-start-2"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  Thank you for joining Eco Caret. Check your inbox.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
