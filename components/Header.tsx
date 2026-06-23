"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store";
import { THEME_COLORS } from "@/theme/colors";

interface HeaderProps {
  scrolled: boolean;
  setCartOpen: (open: boolean) => void;
  setProfileOpen: (open: boolean) => void;
  cartItemsCount: number;
}

interface Collection {
  id: string;
  label: string;
  href: string;
}

type MegaMenuObject = {
  [key: string]: Collection[];
}

const SHOP_BY_SHAPE_SECTION: Collection[] = [
  { id: "baguette", label: "Baguette", href: "/collections?collection=baguette" },
  { id: "emerald", label: "Emerald", href: "/collections?collection=emerald" },
  { id: "princess", label: "Princess", href: "/collections?collection=princess" },
  { id: "round", label: "Round", href: "/collections?collection=round" },
  { id: "oval", label: "Oval", href: "/collections?collection=oval" },
  { id: "pear", label: "Pear", href: "/collections?collection=pear" },
  { id: "heart", label: "Heart", href: "/collections?collection=heart" },
  { id: "marquise", label: "Marquise", href: "/collections?collection=marquise" },
];

const SHOP_BY_GENDER: Collection[] = [
  { id: "male", label: "Men", href: "/collections?collection=male" },
  { id: "female", label: "Women", href: "/collections?collection=female" },
  { id: "unisex", label: "Unisex", href: "/collections?collection=unisex" },
]

const SHOP_BY_METAL_SECTION = [
  { id: "14K", label: "14K Gold", href: "/collections?collection=14K-gold" },
  { id: "10K", label: "10K Gold", href: "/collections?collection=10K-gold" }
]


const BRACELET_COLLECTIONS: Collection[] = [
  { id: "bangles", label: "Bangles", href: "/collections?collection=bangles" },
  { id: "bracelets", label: "Bracelets", href: "/collections?collection=bracelets" },
];

const NECKLACES_COLLECTIONS: Collection[] = [
  { id: "cuban", label: "Cuban Necklace", href: "/collections?collection=cuban-necklace" },
  { id: "tennis", label: "Tennis Necklace", href: "/collections?collection=tennis-necklace" },
  { id: "charm", label: "Charm Necklace", href: "/collections?collection=charm-necklace" },
];


const PENDANTS_COLLECTIONS: Collection[] = [
  { id: "solitaire", label: "Solitaire", href: "/collections?category=pendants&subcategory=solitaire-pendants" },
  { id: "cross", label: "Cross", href: "/collections?category=pendants&subcategory=cross" },
  { id: "heart", label: "Heart", href: "/collections?category=pendants&subcategory=heart" },
  { id: "initials", label: "Initials", href: "/collections?category=pendants&subcategory=initials" },
  { id: "halo", label: "Halo", href: "/collections?category=pendants&subcategory=halo" },
  { id: "music", label: "Music", href: "/collections?category=pendants&subcategory=music" },
  { id: "wild-life", label: "Wild Life", href: "/collections?category=pendants&subcategory=wild-life" },
  { id: "infinity", label: "Infinity", href: "/collections?category=pendants&subcategory=infinity" },
  { id: "spot", label: "Spot", href: "/collections?category=pendants&subcategory=spot" },
  { id: "plain-gold", label: "Plain Gold", href: "/collections?category=pendants&subcategory=plain-gold" },
  { id: "patriotic-jewelry", label: "Patriotic Jewelry", href: "/collections?category=pendants&subcategory=patriotic-jewlery" },
  { id: "fathers-day", label: "Father's Day", href: "/collections?category=pendants&subcategory=fathers-day" },
  { id: "mom", label: "Mom", href: "/collections?category=pendants&subcategory=mom" },
  { id: "religious", label: "Religious", href: "/collections?category=pendants&subcategory=religious" },
  { id: "egyptian-pieces", label: "Egyptian Pieces", href: "/collections?category=pendants&subcategory=egyptian-pieces" },
  { id: "statement", label: "Statement", href: "/collections?category=pendants&subcategory=statement" },
]

const CHAINS_COLLECTIONS: Collection[] = [
  { id: "snakes", label: "Snakes", href: "/collections?category=chains&subcategory=snake" },
  { id: "miami-cuban-chains", label: "Miami Cuban Chains", href: "/collections?category=chains&subcategory=miami-cubian-chain" },
  { id: "rope-chains", label: "Rope Chains", href: "/collections?category=chains&subcategory=rope-chains" },
  { id: "plain-gold", label: "Plain Gold", href: "/collections?category=chains&subcategory=plain-gold-chain" },
]

const RINGS_COLLECTIONS: Collection[] = [
  { id: "solitaire", label: "Solitaire", href: "/collections?category=rings&subcategory=solitaire-rings" },
  { id: "promise-rings", label: "Promise Rings", href: "/collections?category=rings&subcategory=promise-rings" },
  { id: "mens-rings", label: "Men's Rings", href: "/collections?category=rings&subcategory=mens-rings" },
  { id: "engagement-rings", label: "Engagement", href: "/collections?category=rings&subcategory=engagement" },
  { id: "bridal-sets", label: "Bridal Sets", href: "/collections?category=rings&subcategory=bridal-sets" },
  { id: "wedding-bands", label: "Wedding Bands", href: "/collections?category=rings&subcategory=wedding-bands" },
  { id: "plain-gold-rings", label: "Plain Gold Rings", href: "/collections?category=rings&subcategory=plain-gold" },
  { id: "stackable-rings", label: "Stackable", href: "/collections?category=rings&subcategory=stackable" },
  { id: "eternity-rings", label: "Etrnity", href: "/collections?category=rings&subcategory=eternity" },
  { id: "anniversary-rings", label: "Anniversary Rings", href: "/collections?category=rings&subcategory=anniversary-rings" },
  { id: "birthstone-rings", label: "Statement", href: "/collections?category=rings&subcategory=statement" },
  { id: "three-stone-rings", label: "3 Stone", href: "/collections?category=rings&subcategory=three-stone" },
]

const EARRINGS_COLLECTIONS: Collection[] = [
  { id: "stud-earrings", label: "Stud", href: "/collections/?category=earrings&subcategory=stud-earrings" },
  { id: "hoops-and-huggies", label: "Hopps and Huggies", href: "/collections/?category=earrings&subcategory=hopps-and-huggies" },
  { id: "drop-and-dangle-earrings", label: "Drop And Dangles", href: "/collections/?category=earrings&subcategory=drops-and-dangles" },
  { id: "plain-gold-earrings", label: "Plain Gold", href: "/collections/?category=earrings&subcategory=plain-gold-earrings" },
  { id: "halo-earrings", label: "Halo", href: "/collections/?category=earrings&subcategory=halo-earrings" },
  { id: "solitaire-earrings", label: "Solitaire", href: "/collections/?category=earrings&subcategory=solitaire-earrings" },
  { id: "patriotic-jewelry", label: "Patriotic Jewelry", href: "/collections/?category=earrings&subcategory=patriotic" },
]

const PENDANTS_MENU: MegaMenuObject = {
  "Shop By Collection": PENDANTS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}

const CHAINS_MENU: MegaMenuObject = {
  "Shop By Collection": CHAINS_COLLECTIONS,
  "Shop By Shape": [],
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}

const RINGS_MENU: MegaMenuObject = {
  "Shop By Collection": RINGS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}

const EARRINGS_MENU: MegaMenuObject = {
  "Shop By Collection": EARRINGS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}


const BRACELET_MENU: MegaMenuObject = {
  "Shop By Collection": BRACELET_COLLECTIONS,
  "Shop By Shape": [],
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}

const NECKLACE_MENU: MegaMenuObject = {
  "Shop By Collection": NECKLACES_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
}

export default function Header({
  scrolled,
  setCartOpen,
  setProfileOpen,
  cartItemsCount,
}: HeaderProps) {
  const user = useAppSelector((state) => state.profile.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderMobileMenu = () => {
    return (
      <div
        className={`fixed inset-0 z-[200] bg-surface/95 backdrop-blur-xl flex flex-col lg:hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none"
          }`}
      >
        <div className="flex justify-between items-center px-margin-mobile py-4 border-b border-outline-variant/20 h-20">
          <a
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: THEME_COLORS.global.primary }}
            className="font-display-lg text-headline-md tracking-tighter cursor-pointer"
          >
            Eco Caret
          </a>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="material-symbols-outlined p-2 hover:bg-primary/10 rounded-full transition-colors"
            style={{ color: THEME_COLORS.global.primary }}
          >
            close
          </button>
        </div>
        <div className="flex flex-col p-margin-mobile gap-8 font-body-md text-headline-sm overflow-y-auto mt-4">
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Collections</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Pendants</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Chains</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Rings</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Earrings</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Bracelets</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/collections">Necklaces</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/our-story">Our Story</Link>
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/custom">Custom</Link>
          {user && <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/orders">Order History</Link>}
          <Link onClick={() => setMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors" href="/#atelier">Heritage</Link>
          <div className="mt-8 border-t border-outline-variant/20 pt-8 flex gap-6">
            <Link href="/collections?consultation=true" onClick={() => setMobileMenuOpen(false)} className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md text-label-md hover:bg-primary-container transition-colors text-center w-full shadow-md">
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    )
  }


  const renderDynamicMegaMenu = (menuObject: MegaMenuObject) => {
    return (
      <div className="absolute left-0 top-full w-full bg-surface-bright/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-xl transition-all duration-300 z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
          <div className="grid grid-cols-4 gap-12">
            {/* Column 1: Shop By Collection */}
            <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Collection</h3>
              <ul className="space-y-4 max-h-[60vh] flex flex-col flex-wrap gap-x-8">
                {menuObject['Shop By Collection'].map((x) => {
                  return (
                    <li key={x.id}><Link href={x.href}> {x.label}</Link></li>
                  )
                })}
              </ul>
            </div>

            {/* Column 2: Shop By Shape */}
            {Object.values(menuObject['Shop By Shape']).length > 0 && <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Shape</h3>
              <ul className="space-y-4">
                {menuObject['Shop By Shape'].map((x) => {
                  return (
                    <li key={x.id}><Link href={x.href}> {x.label}</Link></li>
                  )
                })}
              </ul>
            </div>}

            {/* Column 2: Shop By Gender */}
            {Object.values(menuObject['Shop By Gender']).length > 0 && <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Gender</h3>
              <ul className="space-y-4">
                {menuObject['Shop By Gender'].map((x) => {
                  return (
                    <li key={x.id}><Link href={x.href}> {x.label}</Link></li>
                  )
                })}
              </ul>
            </div>}

            {/* Column 3: Shop By Metal */}
            {Object.values(menuObject['Shop By Metal']).length > 0 && <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Metal</h3>
              <ul className="space-y-4">
                {menuObject['Shop By Metal'].map((x) => {
                  return (
                    <li key={x.id}><Link href={x.href}> {x.label}</Link></li>
                  )
                })}
              </ul>
            </div>}
          </div>
        </div>
      </div>
    )
  }

  const renderChainsMegaMenu = () => {
    return (
      <div className="absolute left-0 top-full w-full bg-surface-bright/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-xl transition-all duration-300 z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
          <div className="grid grid-cols-3 gap-12">
            {/* Column 1: Shop By Collection */}
            <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Collection</h3>
              <ul className="space-y-4 max-h-[60vh] flex flex-col flex-wrap gap-x-8">
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?collection=snakes">Snakes</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?collection=miami-cuban-chains">Miami Cuban Chains</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?collection=rope-chains">Rope Chains</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?collection=plain-gold">Plain Gold</Link></li>
              </ul>
            </div>
            {/* Column 2: Shop By Gender */}
            <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Gender</h3>
              <ul className="space-y-4">
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?gender=men">Men</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?gender=women">Women</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?gender=unisex">Unisex</Link></li>
              </ul>
            </div>
            {/* Column 3: Shop By Metal */}
            <div className="space-y-6">
              <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Shop By Metal</h3>
              <ul className="space-y-4">
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?metal=14k-gold">14K Gold</Link></li>
                <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?metal=10k-gold">10K Gold</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <nav
      id="top-nav"
      className={`fixed top-0 w-full z-[100] flex justify-between items-center px-margin-mobile md:px-margin-desktop transition-all duration-300 ease-in-out ${scrolled
        ? "h-16 bg-surface/95 backdrop-blur-md shadow-sm border-b border-outline-variant/20"
        : "h-20 bg-surface border-b border-transparent"
        }`}
    >
      <a
        href="/"
        style={{ color: THEME_COLORS.global.primary }}
        className="font-display-lg text-headline-md lg:text-display-lg tracking-tighter cursor-pointer"
      >
        Eco Caret
      </a>
      <div className="hidden lg:flex items-center gap-6 font-body-md text-body-md font-medium h-full">
        <div className="group h-full flex items-center">
          <a
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections"
          >
            Collections
          </a>
          <div className="absolute left-0 top-full w-full bg-surface-bright/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-xl transition-all duration-300 z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
            <div className="max-w-container-max mx-auto px-margin-desktop py-12">
              <div className="grid grid-cols-4 gap-12">
                {/* Column 1: Categories */}
                <div className="space-y-6">
                  <h3 className="font-headline-sm text-label-md uppercase tracking-widest text-secondary">Browse by Category</h3>
                  <ul className="space-y-4">
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=engagement-rings">Engagement Rings</Link></li>
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=wedding-bands">Wedding Bands</Link></li>
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=necklaces">Necklaces</Link></li>
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=earrings">Earrings</Link></li>
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=bracelets">Bracelets</Link></li>
                    <li><Link className="font-body-md text-on-surface-variant hover:text-primary transition-colors block" href="/collections?category=mens-collection">Men's Collection</Link></li>
                  </ul>
                </div>
                {/* Column 2: Featured Collection 1 */}
                <div className="group/item cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                    <img alt="The Bridal Atelier" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida/AP1WRLtrmKXLbOlE9j2MBWqnXPAYkpCDLKUxr2sAsBlGSCTOjqzqzBtzJXIkP54BMdehAyTivg4jpLIktAyOxCLyE88Hq1fnSlQ_XYSl7DKLaOsNK-FWc3W9B5yafIC4gTfu2eg4oW2z1kYWhlvtSKeCLYiT8xrpBB3Wf6FKSb63UM-NWB9cvW_FIfdMqi6MDcD39_hUETmsOHMEru7cccfD-dhZA68yAPxwLz_R7X7KGxg9WCY-jsop_s3FUoM" />
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">The Bridal Atelier</h4>
                  <Link className="font-label-md text-primary flex items-center gap-2" href="/collections?category=bridal-atelier">
                    Discover
                    <span className="material-symbols-outlined text-sm">east</span>
                  </Link>
                </div>
                {/* Column 3: Featured Collection 2 */}
                <div className="group/item cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                    <img alt="Signature Luminous" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo" />
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">Signature Luminous</h4>
                  <Link className="font-label-md text-primary flex items-center gap-2" href="/collections?category=signature-luminous">
                    Discover
                    <span className="material-symbols-outlined text-sm">east</span>
                  </Link>
                </div>
                {/* Column 4: Editorial Highlight */}
                <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img alt="Conflict-Free Craftsmanship" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AP1WRLvSQ6xMFk3vXsnF7sBY6k_feXtvY6gwcEZkZ1sAq0RhR8VzPnPEXwbLL9EEyq6XeenjJDd-cdnPUGqIRpzGsuVjvnvvyoC3D-jKvpqxlbSQhYUQ0AKc3sM37rkvljdKJjlEDpVC4j6Aiacjp4iVPrSZIFshy0iyZZf5zyqEZzDusurL8uSMORvCTCi2Hr4jyfSCINgF7qIDWRoHxIy9NMxuhshvIYYzlLv2Mo7Z40iLV69lJvgaevcEom8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-label-md text-secondary uppercase tracking-widest">Editorial</h4>
                    <p className="font-body-md text-on-surface-variant">Conflict-Free Craftsmanship: A journey from lab to legacy.</p>
                  </div>
                  <Link href="/collections?consultation=true" className="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container transition-colors block text-center">Book a Consultation</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=pendants"
          >
            Pendants
          </Link>
          {renderDynamicMegaMenu(PENDANTS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=chains"
          >
            Chains
          </Link>
          {renderChainsMegaMenu()}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=rings"
          >
            Rings
          </Link>
          {renderDynamicMegaMenu(RINGS_MENU)}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=earrings"
          >
            Earrings
          </Link>
          {renderDynamicMegaMenu(EARRINGS_MENU)}

        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=bracelets"
          >
            Bracelets
          </Link>
          {renderDynamicMegaMenu(BRACELET_MENU)}
        </div>
        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4"
            href="/collections?category=necklaces"
          >
            Necklaces
          </Link>
          {renderDynamicMegaMenu(NECKLACE_MENU)}
        </div>
        <Link
          className="text-on-surface/80 hover:text-primary transition-colors cursor-pointer"
          href="/custom"
        >
          Custom
        </Link>
        {user && (
          <Link
            className="text-on-surface/80 hover:text-primary transition-colors cursor-pointer"
            href="/orders"
          >
            Order History
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4 md:gap-6" style={{ color: THEME_COLORS.global.primary }}>
        <button
          className="lg:hidden material-symbols-outlined hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
        >
          menu
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="material-symbols-outlined hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer relative"
        >
          shopping_bag
          {cartItemsCount > 0 && (
            <span
              style={{ backgroundColor: THEME_COLORS.global.secondary }}
              className="absolute top-1 right-1 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans"
            >
              {cartItemsCount}
            </span>
          )}
        </button>
        {user ? (
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-secondary-fixed-dim overflow-hidden ring-1 ring-primary/20 cursor-pointer block hover:scale-105 transition-transform"
          >
            <img
              alt="Customer profile avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzzmq3JexhIO7YpZClTn2dZgaKmzZLA-d_J4uHyuEGx5Gs0gjAR-ReY_D-DtMsYkXP2eKvsP9gj5_D9dq7IPGQf56dg3tHPu86lqun_wyQr_oMjqt77wXTsLPKC5cXroZT1H3ryKU6zQcEyLqIdA6m6In0OkrVS3C7GBakrzfp8PLQExpvSE-CIAcOcMv17ybWiQZ3XRtifQS8MOPrsxi-_oN6A9FwQAcq5PXx8ZNmGugUYrE7HyfWWDpTQXwFKPN2VUoeiyysI0w"
            />
          </Link>
        ) : (
          <button
            onClick={() => setProfileOpen(true)}
            className="material-symbols-outlined hover:bg-primary/10 transition-all duration-300 p-2 rounded-full cursor-pointer"
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
