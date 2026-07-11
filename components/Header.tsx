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
  { id: "bangles", label: "Bangles", href: "/collections?category=bangles-bracelets" },
  { id: "bracelets", label: "Bracelets", href: "/collections?category=bracelet-bracelets" },
];

const NECKLACES_COLLECTIONS: Collection[] = [
  { id: "cuban", label: "Cuban Necklace", href: "/collections?category=necklaces&subcategory=cuban-necklace" },
  { id: "tennis", label: "Tennis Necklace", href: "/collections?category=necklaces&subcategory=tennis-necklace" },
  { id: "charm", label: "Charm Necklace", href: "/collections?category=necklaces&subcategory=charm-necklace" },
];


const PENDANTS_COLLECTIONS: Collection[] = [
  { id: "solitaire", label: "Solitaire", href: "/collections?category=pendants&subcategory=solitaire-pendants" },
  { id: "cross", label: "Cross", href: "/collections?category=pendants&subcategory=cross-pendants" },
  { id: "heart", label: "Heart", href: "/collections?category=pendants&subcategory=heart-pendants" },
  { id: "initials", label: "Initials", href: "/collections?category=pendants&subcategory=initials-pendants" },
  { id: "halo", label: "Halo", href: "/collections?category=pendants&subcategory=halo-pendants" },
  { id: "music", label: "Music", href: "/collections?category=pendants&subcategory=music-pendants" },
  { id: "wild-life", label: "Wild Life", href: "/collections?category=pendants&subcategory=wild-life-pendants" },
  { id: "infinity", label: "Infinity", href: "/collections?category=pendants&subcategory=infinity-pendants" },
  { id: "spot", label: "Spot", href: "/collections?category=pendants&subcategory=spot-pendants" },
  { id: "plain-gold", label: "Plain Gold", href: "/collections?category=pendants&subcategory=plain-gold-pendants" },
  { id: "patriotic-jewelry", label: "Patriotic Jewelry", href: "/collections?category=pendants&subcategory=patriotic-jewlery-pendants" },
  { id: "fathers-day", label: "Father's Day", href: "/collections?category=pendants&subcategory=fathers-day-pendants" },
  { id: "mom", label: "Mom", href: "/collections?category=pendants&subcategory=mom-pendants" },
  { id: "religious", label: "Religious", href: "/collections?category=pendants&subcategory=religious-pendants" },
  { id: "egyptian-pieces", label: "Egyptian Pieces", href: "/collections?category=pendants&subcategory=egyptian-pieces-pendants" },
  { id: "statement", label: "Statement", href: "/collections?category=pendants&subcategory=statement-pendants" },
]

const CHAINS_COLLECTIONS: Collection[] = [
  { id: "snakes", label: "Snakes", href: "/collections?category=chains&subcategory=snake-chains" },
  { id: "miami-cuban-chains", label: "Miami Cuban Chains", href: "/collections?category=chains&subcategory=miami-cubian-chains" },
  { id: "rope-chains", label: "Rope Chains", href: "/collections?category=chains&subcategory=rope-chains" },
  { id: "plain-gold", label: "Plain Gold", href: "/collections?category=chains&subcategory=plain-gold-chains" },
]

const RINGS_COLLECTIONS: Collection[] = [
  { id: "solitaire", label: "Solitaire", href: "/collections?category=rings&subcategory=solitaire-rings" },
  { id: "promise-rings", label: "Promise Rings", href: "/collections?category=rings&subcategory=promise-rings" },
  { id: "mens-rings", label: "Men's Rings", href: "/collections?category=rings&subcategory=mens-rings" },
  { id: "engagement-rings", label: "Engagement", href: "/collections?category=rings&subcategory=engagement-rings" },
  { id: "bridal-sets", label: "Bridal Sets", href: "/collections?category=rings&subcategory=bridal-sets" },
  { id: "wedding-bands", label: "Wedding Bands", href: "/collections?category=rings&subcategory=wedding-bands-rings" },
  { id: "plain-gold-rings", label: "Plain Gold Rings", href: "/collections?category=rings&subcategory=plain-gold-rings" },
  { id: "stackable-rings", label: "Stackable", href: "/collections?category=rings&subcategory=stackable-rings" },
  { id: "eternity-rings", label: "Etrnity", href: "/collections?category=rings&subcategory=eternity-rings" },
  { id: "anniversary-rings", label: "Anniversary Rings", href: "/collections?category=rings&subcategory=anniversary-rings" },
  { id: "statement-rings", label: "Statement", href: "/collections?category=rings&subcategory=statement-rings" },
  { id: "three-stone-rings", label: "3 Stone", href: "/collections?category=rings&subcategory=three-stone-rings" },
]

const EARRINGS_COLLECTIONS: Collection[] = [
  { id: "stud-earrings", label: "Stud", href: "/collections/?category=earrings&subcategory=stud-earrings" },
  { id: "hoops-and-huggies", label: "Hopps and Huggies", href: "/collections/?category=earrings&subcategory=hopps-and-huggies-earrings" },
  { id: "drop-and-dangle-earrings", label: "Drop And Dangles", href: "/collections/?category=earrings&subcategory=drops-and-dangles-earrings" },
  { id: "plain-gold-earrings", label: "Plain Gold", href: "/collections/?category=earrings&subcategory=plain-gold-earrings" },
  { id: "halo-earrings", label: "Halo", href: "/collections/?category=earrings&subcategory=halo-earrings" },
  { id: "solitaire-earrings", label: "Solitaire", href: "/collections/?category=earrings&subcategory=solitaire-earrings" },
  { id: "patriotic-jewelry", label: "Patriotic Jewelry", href: "/collections/?category=earrings&subcategory=patriotic-earrings" },
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

const MEGA_MENU_FEATURES = {
  pendants: {
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo",
    tag: "Spotlight",
    title: "Signature Solitaires",
    desc: "Captured light in motion, grown under pure atmospheric heat.",
    href: "/collections?category=pendants&subcategory=solitaire-pendants"
  },
  chains: {
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo",
    tag: "New Era",
    title: "Atelier Miami Cuban",
    desc: "The weight of master heritage, hand-forged in recycled gold.",
    href: "/collections?category=chains"
  },
  rings: {
    image: "https://lh3.googleusercontent.com/aida/AP1WRLt0zyESo6pHkVilif4cjlRYBG-P06jrYSEWGr9H_UtHY8zLNEVfPRPINOhbApKi40CG9gcZs6LzfaanB_f0PtWX4y3gmpVnR-cSyLpL3PufPtmHnj2fGf9wC-f2peHAJyNr36TiXH-n-q4cgW6U9TxcEPi3E-78gDneVnjP6SPAn8UAPURBbSEHcc_M_4dCpagmbN23JS5jzMqqjNxj3k7LIRSeFxSkK7BcaeOXshq8JoBtX4Wd_n8lSNw",
    tag: "Engagement",
    title: "The Promise Series",
    desc: "Molecular carbon purity, certified for a lifetime of devotion.",
    href: "/collections?category=rings&subcategory=solitaire-rings"
  },
  earrings: {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzzmq3JexhIO7YpZClTn2dZgaKmzZLA-d_J4uHyuEGx5Gs0gjAR-ReY_D-DtMsYkXP2eKvsP9gj5_D9dq7IPGQf56dg3tHPu86lqun_wyQr_oMjqt77wXTsLPKC5cXroZT1H3ryKU6zQcEyLqIdA6m6In0OkrVS3C7GBakrzfp8PLQExpvSE-CIAcOcMv17ybWiQZ3XRtifQS8MOPrsxi-_oN6A9FwQAcq5PXx8ZNmGugUYrE7HyfWWDpTQXwFKPN2VUoeiyysI0w",
    tag: "Atelier Studs",
    title: "Minimalist Geometry",
    desc: "Four-claw classic structures designed for pure light reflection.",
    href: "/collections?category=earrings&subcategory=stud-earrings"
  },
  bracelets: {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    tag: "Sovereignty",
    title: "Atelier Bangles",
    desc: "Circlets of ethical white gold, fluid structure, unmatched comfort.",
    href: "/collections?category=bracelets"
  },
  necklaces: {
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsvk8wW-v6NGesvrahUuVR8eohLUVJKTpCPWbK5cY9UhmGg8OD46eJ60ess0iUTpY7IVZ9JjGyBGIMLbKknNvnjiTZ06nTCCIQRPRdYhm9-AGE7QNExFXI9Sui3EpPKRvOxxWT7S5YNWkl2ShnmnnGXUzlwRGd31PhijpmiXMUlRk3QacCvpz7AwsBLPlvaPuEvWPwnn1vQtPTmy5dsOEPPXGuLXmvCXX8n1Xbzy6RrbNtxc9ii1c0uOTo",
    tag: "Masterpiece",
    title: "Recycled Tennis Collar",
    desc: "A seamless cascade of brilliant-cut diamonds without earth impact.",
    href: "/collections?category=necklaces"
  }
} as const;

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

  const renderDynamicMegaMenu = (menuObject: MegaMenuObject, categoryId: keyof typeof MEGA_MENU_FEATURES) => {
    const feature = MEGA_MENU_FEATURES[categoryId];
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

            {/* Editorial Feature Box (3 columns) */}
            <div className="col-span-3">
              <Link href={feature.href} className="group/card block space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm relative">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-background/85 backdrop-blur-sm text-[9px] font-bold tracking-widest uppercase text-secondary px-2.5 py-1 rounded-full border border-outline-variant/20">
                    {feature.tag}
                  </span>
                </div>
                <div className="space-y-1">
                  <h5 className="font-[family:var(--font-playfair-display)] text-lg font-semibold text-on-surface group-hover/card:text-primary transition-colors">
                    {feature.title}
                  </h5>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {feature.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-secondary mt-1 group-hover/card:gap-2 transition-all">
                    Discover Atelier →
                  </span>
                </div>
              </Link>
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
          {renderDynamicMegaMenu(PENDANTS_MENU, "pendants")}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=chains"
          >
            Chains
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(CHAINS_MENU, "chains")}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=rings"
          >
            Rings
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(RINGS_MENU, "rings")}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=earrings"
          >
            Earrings
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(EARRINGS_MENU, "earrings")}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=bracelets"
          >
            Bracelets
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(BRACELET_MENU, "bracelets")}
        </div>

        <div className="group h-full flex items-center">
          <Link
            className="text-on-surface/80 group-hover:text-primary transition-colors cursor-pointer py-4 relative"
            href="/collections?category=necklaces"
          >
            Necklaces
            <span className="absolute bottom-3 left-0 w-full h-[2px] bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {renderDynamicMegaMenu(NECKLACE_MENU, "necklaces")}
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
