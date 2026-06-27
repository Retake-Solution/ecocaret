import React from "react";

export const RoundSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full object-contain p-12 text-secondary drop-shadow-[0_0_15px_rgba(var(--color-secondary),0.5)]" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="50" cy="50" r="40" />
    <circle cx="50" cy="50" r="22" />
    <polygon points="50,10 78,22 90,50 78,78 50,90 22,78 10,50 22,22" />
    <path d="M50 10 L50 90 M10 50 L90 50" strokeOpacity="0.4" />
    <path d="M22 22 L78 78 M22 78 L78 22" strokeOpacity="0.4" />
    <path d="M50 10 L64 36 L90 50 L64 64 L50 90 L36 64 L10 50 L36 36 Z" strokeWidth="1" />
  </svg>
);

export const PrincessSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full object-contain p-12 text-secondary drop-shadow-[0_0_15px_rgba(var(--color-secondary),0.5)]" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="15" y="15" width="70" height="70" />
    <rect x="30" y="30" width="40" height="40" />
    <path d="M15 15 L50 50 L85 15 M85 85 L50 50 L15 85" strokeWidth="1" />
    <path d="M15 50 L30 30 L50 15 L70 30 L85 50 L70 70 L50 85 L30 70 Z" strokeWidth="1" />
  </svg>
);

export const EmeraldSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full object-contain p-16 text-secondary drop-shadow-[0_0_15px_rgba(var(--color-secondary),0.5)]" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" />
    <polygon points="40,25 60,25 75,40 75,60 60,75 40,75 25,60 25,40" />
    <polygon points="45,35 55,35 65,45 65,55 55,65 45,65 35,55 35,45" />
    <path d="M30 10 L40 25 M70 10 L60 25 M90 30 L75 40 M90 70 L75 60 M70 90 L60 75 M30 90 L40 75 M10 70 L25 60 M10 30 L25 40" />
  </svg>
);

export const OvalSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full object-contain p-12 text-secondary drop-shadow-[0_0_15px_rgba(var(--color-secondary),0.5)]" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="50" cy="50" rx="35" ry="45" />
    <ellipse cx="50" cy="50" rx="20" ry="30" />
    <path d="M50 5 L50 95 M15 50 L85 50" strokeOpacity="0.4" />
    <path d="M25 25 L75 75 M25 75 L75 25" strokeOpacity="0.4" />
    <path d="M50 5 L65 35 L85 50 L65 65 L50 95 L35 65 L15 50 L35 35 Z" strokeWidth="1" />
  </svg>
);
