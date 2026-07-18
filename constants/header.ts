export interface Collection {
  id: string;
  label: string;
  href: string;
}

export type MegaMenuObject = {
  [key: string]: Collection[];
};

export const SHOP_BY_SHAPE_SECTION: Collection[] = [
  { id: "baguette", label: "Baguette", href: "/collections?collection=baguette" },
  { id: "emerald", label: "Emerald", href: "/collections?collection=emerald" },
  { id: "princess", label: "Princess", href: "/collections?collection=princess" },
  { id: "round", label: "Round", href: "/collections?collection=round" },
  { id: "oval", label: "Oval", href: "/collections?collection=oval" },
  { id: "pear", label: "Pear", href: "/collections?collection=pear" },
  { id: "heart", label: "Heart", href: "/collections?collection=heart" },
  { id: "marquise", label: "Marquise", href: "/collections?collection=marquise" },
];

export const SHOP_BY_GENDER: Collection[] = [
  { id: "male", label: "Men", href: "/collections?collection=male" },
  { id: "female", label: "Women", href: "/collections?collection=female" },
  { id: "unisex", label: "Unisex", href: "/collections?collection=unisex" },
];

export const SHOP_BY_METAL_SECTION: Collection[] = [
  { id: "14K", label: "14K Gold", href: "/collections?collection=14K-gold" },
  { id: "10K", label: "10K Gold", href: "/collections?collection=10K-gold" },
];

export const BRACELET_COLLECTIONS: Collection[] = [
  { id: "bangles", label: "Bangles", href: "/collections?category=bangles-bracelets" },
  { id: "bracelets", label: "Bracelets", href: "/collections?category=bracelet-bracelets" },
];

export const NECKLACES_COLLECTIONS: Collection[] = [
  { id: "cuban", label: "Cuban Necklace", href: "/collections?category=necklaces&subcategory=cuban-necklace" },
  { id: "tennis", label: "Tennis Necklace", href: "/collections?category=necklaces&subcategory=tennis-necklace" },
  { id: "charm", label: "Charm Necklace", href: "/collections?category=necklaces&subcategory=charm-necklace" },
];

export const PENDANTS_COLLECTIONS: Collection[] = [
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
];

export const CHAINS_COLLECTIONS: Collection[] = [
  { id: "snakes", label: "Snakes", href: "/collections?category=chains&subcategory=snake-chains" },
  { id: "miami-cuban-chains", label: "Miami Cuban Chains", href: "/collections?category=chains&subcategory=miami-cubian-chains" },
  { id: "rope-chains", label: "Rope Chains", href: "/collections?category=chains&subcategory=rope-chains" },
  { id: "plain-gold", label: "Plain Gold", href: "/collections?category=chains&subcategory=plain-gold-chains" },
];

export const RINGS_COLLECTIONS: Collection[] = [
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
];

export const EARRINGS_COLLECTIONS: Collection[] = [
  { id: "stud-earrings", label: "Stud", href: "/collections/?category=earrings&subcategory=stud-earrings" },
  { id: "hoops-and-huggies", label: "Hopps and Huggies", href: "/collections/?category=earrings&subcategory=hopps-and-huggies-earrings" },
  { id: "drop-and-dangle-earrings", label: "Drop And Dangles", href: "/collections/?category=earrings&subcategory=drops-and-dangles-earrings" },
  { id: "plain-gold-earrings", label: "Plain Gold", href: "/collections/?category=earrings&subcategory=plain-gold-earrings" },
  { id: "halo-earrings", label: "Halo", href: "/collections/?category=earrings&subcategory=halo-earrings" },
  { id: "solitaire-earrings", label: "Solitaire", href: "/collections/?category=earrings&subcategory=solitaire-earrings" },
  { id: "patriotic-jewelry", label: "Patriotic Jewelry", href: "/collections/?category=earrings&subcategory=patriotic-earrings" },
];

export const PENDANTS_MENU: MegaMenuObject = {
  "Shop By Collection": PENDANTS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};

export const CHAINS_MENU: MegaMenuObject = {
  "Shop By Collection": CHAINS_COLLECTIONS,
  "Shop By Shape": [],
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};

export const RINGS_MENU: MegaMenuObject = {
  "Shop By Collection": RINGS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};

export const EARRINGS_MENU: MegaMenuObject = {
  "Shop By Collection": EARRINGS_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};

export const BRACELET_MENU: MegaMenuObject = {
  "Shop By Collection": BRACELET_COLLECTIONS,
  "Shop By Shape": [],
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};

export const NECKLACE_MENU: MegaMenuObject = {
  "Shop By Collection": NECKLACES_COLLECTIONS,
  "Shop By Shape": SHOP_BY_SHAPE_SECTION,
  "Shop By Gender": SHOP_BY_GENDER,
  "Shop By Metal": SHOP_BY_METAL_SECTION,
};
