"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import CurrencySelector from "@/components/CurrencySelector";
import { useAppSelector } from "@/lib/store";
import { getProfileAvatarDisplay } from "@/lib/profileEdit";
import { THEME_COLORS } from "@/theme/colors";
import {
  BRACELET_COLLECTIONS,
  BRACELET_MENU,
  CHAINS_COLLECTIONS,
  CHAINS_MENU,
  EARRINGS_COLLECTIONS,
  EARRINGS_MENU,
  NECKLACES_COLLECTIONS,
  NECKLACE_MENU,
  PENDANTS_COLLECTIONS,
  PENDANTS_MENU,
  RINGS_COLLECTIONS,
  RINGS_MENU,
  type MegaMenuObject,
} from "@/constants/header";

const subscribeHydration = (onStoreChange: () => void) => {
  const timeoutId = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(timeoutId);
};

const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const useHasHydrated = () =>
  useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

interface HeaderProps {
  scrolled: boolean;
  setCartOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  cartItemsCount: number;
}

export default function Header({
  scrolled,
  setCartOpen,
  setProfileOpen,
  cartItemsCount,
}: HeaderProps) {
  const hasHydrated = useHasHydrated();
  const storedUser = useAppSelector((state) => state.profile.user);
  const user = hasHydrated ? storedUser : null;
  const safeCartItemsCount = hasHydrated ? cartItemsCount : 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatar = getProfileAvatarDisplay(user);

  const renderCurrencySlot = (compact = false, className = "") => {
    if (!hasHydrated) {
      return (
        <div
          className={`inline-flex h-11 items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 text-on-surface-variant shadow-sm ${className}`}
          aria-hidden="true"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
            $
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Currency
            </span>
            <span className="text-[11px] font-bold tracking-wide">USD</span>
          </span>
        </div>
      );
    }

    return <CurrencySelector compact={compact} className={className} label="Currency" />;
  };

  const renderMobileMenu = () => {
    return (
      <div
        className={`fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-500 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[85vw] max-w-[400px] bg-background shadow-2xl flex flex-col z-[210] transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20 h-20">
            <span className="font-display-lg text-headline-sm font-semibold tracking-tighter text-primary">
              Eco Caret
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="material-symbols-outlined p-2 hover:bg-primary/10 rounded-full transition-colors cursor-pointer"
            >
              close
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
                Currency
              </span>
              {renderCurrencySlot(false, "w-full")}
            </div>

            {/* Category Accordions */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
                Categories
              </span>
              
              {/* Accordion 1: Pendants */}
              <details className="group/accordion border-b border-outline-variant/15 pb-3">
                <summary className="list-none flex items-center justify-between font-label-md text-on-surface font-semibold cursor-pointer py-1.5">
                  <span>Pendants</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open/accordion:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="pt-2 pl-4 space-y-2 flex flex-col text-body-sm text-on-surface-variant">
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=pendants">All Pendants</Link>
                  {PENDANTS_COLLECTIONS.slice(0, 5).map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                </div>
              </details>

              {/* Accordion 2: Rings */}
              <details className="group/accordion border-b border-outline-variant/15 pb-3">
                <summary className="list-none flex items-center justify-between font-label-md text-on-surface font-semibold cursor-pointer py-1.5">
                  <span>Rings</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open/accordion:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="pt-2 pl-4 space-y-2 flex flex-col text-body-sm text-on-surface-variant">
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=rings">All Rings</Link>
                  {RINGS_COLLECTIONS.slice(0, 5).map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                </div>
              </details>

              {/* Accordion 3: Earrings */}
              <details className="group/accordion border-b border-outline-variant/15 pb-3">
                <summary className="list-none flex items-center justify-between font-label-md text-on-surface font-semibold cursor-pointer py-1.5">
                  <span>Earrings</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open/accordion:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="pt-2 pl-4 space-y-2 flex flex-col text-body-sm text-on-surface-variant">
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=earrings">All Earrings</Link>
                  {EARRINGS_COLLECTIONS.slice(0, 5).map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                </div>
              </details>

              {/* Accordion 4: Necklaces & Chains */}
              <details className="group/accordion border-b border-outline-variant/15 pb-3">
                <summary className="list-none flex items-center justify-between font-label-md text-on-surface font-semibold cursor-pointer py-1.5">
                  <span>Necklaces & Chains</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open/accordion:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="pt-2 pl-4 space-y-2 flex flex-col text-body-sm text-on-surface-variant">
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=necklaces">All Necklaces</Link>
                  {NECKLACES_COLLECTIONS.map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=chains">All Chains</Link>
                  {CHAINS_COLLECTIONS.map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                </div>
              </details>

              {/* Accordion 5: Bracelets */}
              <details className="group/accordion border-b border-outline-variant/15 pb-3">
                <summary className="list-none flex items-center justify-between font-label-md text-on-surface font-semibold cursor-pointer py-1.5">
                  <span>Bracelets</span>
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open/accordion:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="pt-2 pl-4 space-y-2 flex flex-col text-body-sm text-on-surface-variant">
                  <Link onClick={() => setMobileMenuOpen(false)} href="/collections?category=bracelets">All Bracelets</Link>
                  {BRACELET_COLLECTIONS.map((x) => (
                    <Link key={x.id} onClick={() => setMobileMenuOpen(false)} href={x.href}>{x.label}</Link>
                  ))}
                </div>
              </details>
            </div>

            {/* Direct Links */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/40 uppercase">
                Explore
              </span>
              <div className="flex flex-col gap-4 font-label-md text-on-surface font-semibold pl-1">
                <Link onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors" href="/collections">All Collections</Link>
                {user && (
                  <Link onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors" href="/orders">Order History</Link>
                )}

                <Link onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors" href="/#atelier">Heritage</Link>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest flex flex-col gap-4">
            <Link 
              href="/collections?consultation=true" 
              onClick={() => setMobileMenuOpen(false)} 
              className="bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md hover:bg-primary-container transition-all text-center font-bold tracking-wider shadow-md w-full"
            >
              Book Consultation
            </Link>
            <div className="text-center text-[10px] text-on-surface-variant/60 font-medium">
              Eco Caret Atelier · London & Antwerp
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDynamicMegaMenu = (menuObject: MegaMenuObject) => {
    return (
      <div className="absolute left-0 top-full w-full bg-surface-bright/95 backdrop-blur-xl border-b border-outline-variant/15 shadow-xl transition-all duration-300 z-[150] opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop py-10">
          <div className="grid grid-cols-12 gap-10">
            {/* Category Lists (9 columns) */}
            <div className="col-span-9 flex gap-10 border-r border-outline-variant/15 pr-8">
              {/* Column 1: Shop By Collection */}
              <div className={`${menuObject['Shop By Collection'].length > 6 ? "flex-[2]" : "flex-1"} space-y-4`}>
                <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-bold">
                  Shop By Collection
                </h4>
                {menuObject['Shop By Collection'].length > 6 ? (
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm">
                    {menuObject['Shop By Collection'].map((x) => (
                      <li key={x.id} className="hover:text-primary transition-colors">
                        <Link href={x.href}>{x.label}</Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3 text-body-sm">
                    {menuObject['Shop By Collection'].map((x) => (
                      <li key={x.id} className="hover:text-primary transition-colors">
                        <Link href={x.href}>{x.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Column 2: Shop By Shape */}
              {menuObject['Shop By Shape'] && menuObject['Shop By Shape'].length > 0 && (
                <div className="flex-1 space-y-4">
                  <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-bold">
                    Shop By Shape
                  </h4>
                  <ul className="space-y-3 text-body-sm">
                    {menuObject['Shop By Shape'].map((x) => (
                      <li key={x.id} className="hover:text-primary transition-colors">
                        <Link href={x.href}>{x.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Column 3: Shop By Gender / Metal */}
              <div className="flex-1 space-y-6">
                {menuObject['Shop By Gender'] && menuObject['Shop By Gender'].length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-bold">
                      Shop By Gender
                    </h4>
                    <ul className="space-y-3 text-body-sm">
                      {menuObject['Shop By Gender'].map((x) => (
                        <li key={x.id} className="hover:text-primary transition-colors">
                          <Link href={x.href}>{x.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {menuObject['Shop By Metal'] && menuObject['Shop By Metal'].length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-bold">
                      Shop By Metal
                    </h4>
                    <ul className="space-y-3 text-body-sm">
                      {menuObject['Shop By Metal'].map((x) => (
                        <li key={x.id} className="hover:text-primary transition-colors">
                          <Link href={x.href}>{x.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <nav
      id="top-nav"
      className={`fixed top-0 w-full z-[999] flex justify-between items-center px-margin-mobile md:px-margin-desktop transition-all duration-300 ease-in-out ${scrolled
        ? "h-16 bg-surface/95 backdrop-blur-md shadow-sm border-b border-outline-variant/15"
        : "h-20 bg-surface border-b border-transparent"
        }`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-menu-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-menu-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-menu-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(109, 128, 122, 0.25);
          border-radius: 2px;
        }
        .custom-menu-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(109, 128, 122, 0.45);
        }
      `}} />
      <Link
        href="/"
        style={{ color: THEME_COLORS.global.primary }}
        className="font-display-lg text-headline-md lg:text-display-lg tracking-tighter cursor-pointer font-bold"
      >
        Eco Caret
      </Link>
      <div className="hidden lg:flex items-center gap-6 font-body-md text-body-md font-medium h-full">
        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=pendants"
          >
            Pendants
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(PENDANTS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=chains"
          >
            Chains
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(CHAINS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=rings"
          >
            Rings
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(RINGS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=earrings"
          >
            Earrings
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(EARRINGS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=bracelets"
          >
            Bracelets
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(BRACELET_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=necklaces"
          >
            Necklaces
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(NECKLACE_MENU)}
        </div>



        {user && (
          <div className="group h-full flex items-center">
            <Link
              className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
              href="/orders"
            >
              Order History
              <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6" style={{ color: THEME_COLORS.global.primary }}>
        {renderCurrencySlot(true, "hidden md:inline-flex")}
        <button
          className="md:hidden hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer flex items-center justify-center"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="material-symbols-outlined hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer relative hover:scale-105 active:scale-95 transition-transform"
        >
          shopping_bag
          {safeCartItemsCount > 0 && (
            <span
              style={{ backgroundColor: THEME_COLORS.global.secondary }}
              className="absolute top-1 right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans"
            >
              {safeCartItemsCount}
            </span>
          )}
        </button>
        {user ? (
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-secondary-fixed-dim overflow-hidden ring-1 ring-primary/20 cursor-pointer flex items-center justify-center hover:scale-105 transition-transform text-[11px] font-bold text-primary"
          >
            {avatar.type === "image" ? (
              <img
                alt={avatar.alt}
                className="w-full h-full object-cover"
                src={avatar.url}
              />
            ) : (
              <span>{avatar.initials}</span>
            )}
          </Link>
        ) : (
          <button
            onClick={() => setProfileOpen(true)}
            className="material-symbols-outlined hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            person
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {renderMobileMenu()}
    </nav>
  );
}
