"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import Hero from "@/components/Hero";
import Button from "@/components/Button";
import {
  HOME_COLLECTIONS,
  HOME_PROCESS_STEPS,
  HOME_PROMISES,
} from "@/constants/home";

const revealViewport = { once: true, amount: 0.22 };

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
} satisfies Variants;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: "easeOut" },
  },
} satisfies Variants;

const cardReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} satisfies Variants;

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    window.setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 5000);
  };

  const revealInitial = shouldReduceMotion ? false : "hidden";
  const hoverLift = shouldReduceMotion ? undefined : { y: -6 };
  const hoverPress = shouldReduceMotion ? undefined : { scale: 0.98 };

  return (
    <>
      <main>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Hero />
        </motion.div>

        <motion.section
          className="bg-surface px-margin-mobile pt-28 pb-14 md:px-margin-desktop md:py-20"
          initial={revealInitial}
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-container-max">
            <motion.h2
              className="text-center font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-on-surface md:text-5xl"
              variants={fadeUp}
            >
              Shop The Edit
            </motion.h2>

            <motion.div
              className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
              variants={staggerContainer}
            >
              {HOME_COLLECTIONS.map((collection) => (
                <motion.div
                  key={collection.name}
                  variants={cardReveal}
                  whileHover={hoverLift}
                  whileTap={hoverPress}
                >
                  <Link
                    href={collection.href}
                    className="group flex min-h-36 flex-col items-center justify-center gap-4 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-5 text-center shadow-sm transition-colors duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                      {collection.icon}
                    </span>
                    <h3 className="font-headline-sm text-xl text-on-surface transition-colors group-hover:text-primary">
                      {collection.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="relative overflow-hidden bg-inverse-surface px-margin-mobile py-16 text-inverse-on-surface md:px-margin-desktop md:py-24"
          initial={revealInitial}
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer}
        >
          <div className="absolute left-0 top-0 h-full w-1/2 bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-container-max">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <motion.div className="space-y-4" variants={fadeUp}>
                <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-primary">
                  From Source To Setting
                </p>
                <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-white md:text-5xl">
                  A buying journey that explains itself as it moves.
                </h2>
              </motion.div>
              <motion.p
                className="font-body-md text-body-md leading-relaxed text-inverse-on-surface/76"
                variants={fadeUp}
              >
                Customers should not need to decode conscious jewelry. The page now
                stages the material story as a compact timeline, with each step arriving
                in sequence as the section enters view.
              </motion.p>
            </div>

            <motion.div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4" variants={staggerContainer}>
              {HOME_PROCESS_STEPS.map((item) => (
                <motion.div
                  key={item.step}
                  className="relative overflow-hidden rounded-lg border border-inverse-on-surface/16 bg-white/[0.04] p-5 backdrop-blur-sm"
                  variants={cardReveal}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <span className="absolute -right-3 -top-4 font-[family:var(--font-playfair-display)] text-7xl text-white/5" aria-hidden="true">
                    {item.step}
                  </span>
                  <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-inverse-primary">
                    Step {item.step}
                  </p>
                  <h3 className="mt-5 font-headline-sm text-2xl text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-md text-sm leading-relaxed text-inverse-on-surface/72">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="bg-surface-container px-margin-mobile py-16 md:px-margin-desktop md:py-24"
          initial={revealInitial}
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-container-max">
            <motion.div className="mb-10 max-w-2xl space-y-3" variants={fadeUp}>
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-primary">
                Eco Caret Promise
              </p>
              <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight text-on-surface md:text-5xl">
                Beauty with standards you can explain.
              </h2>
            </motion.div>

            <motion.div className="grid gap-4 md:grid-cols-3" variants={staggerContainer}>
              {HOME_PROMISES.map((item) => (
                <motion.div
                  key={item.title}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm"
                  variants={cardReveal}
                  whileHover={hoverLift}
                >
                  <motion.span
                    className="material-symbols-outlined text-3xl text-primary"
                    aria-hidden="true"
                    whileHover={shouldReduceMotion ? undefined : { rotate: 8, scale: 1.08 }}
                  >
                    {item.icon}
                  </motion.span>
                  <h3 className="mt-6 font-headline-sm text-2xl text-on-surface">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body-md text-body-md leading-relaxed text-on-surface-variant">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="bg-primary px-margin-mobile py-14 text-on-primary md:px-margin-desktop md:py-20"
          initial={revealInitial}
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerContainer}
        >
          <div className="mx-auto grid max-w-container-max gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div className="space-y-4" variants={fadeUp}>
              <p className="font-label-sm text-[11px] font-bold uppercase tracking-widest text-on-primary/75">
                Conscious Notes
              </p>
              <h2 className="font-[family:var(--font-playfair-display)] text-3xl font-medium leading-tight md:text-5xl">
                Limited drops, care notes, and material stories.
              </h2>
              <p className="font-body-md text-body-md leading-relaxed text-on-primary/78">
                Join the Eco Caret list for new collections and thoughtful guidance,
                without noisy inbox clutter.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubscribe}
              className="rounded-lg border border-white/25 bg-white/10 p-3 backdrop-blur-md sm:flex sm:items-center sm:gap-3"
              variants={fadeUp}
            >
              <label className="sr-only" htmlFor="home-newsletter-email">
                Email address
              </label>
              <input
                id="home-newsletter-email"
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
          </div>
        </motion.section>
      </main>

    </>
  );
}
