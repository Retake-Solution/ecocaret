export interface Product {
  id: string;
  name: string;
  category: string; // Diamond Cut / Type
  metal: string; // Default Metal Finishes
  carat: number;
  price: number;
  image: string;
  images: string[]; // Main and thumbnails
  specs: string;
  description: string;
  colorGrade: string;
  clarity: string;
  certification: string;
  stoneOrigin: string;
  availableMetals: { name: string; hex: string; title: string }[];
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "celestial-halo",
    name: "Celestia Brilliant Solitaire",
    category: "Brilliant Round",
    metal: "White Gold",
    carat: 1.55,
    price: 4800,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A",
    images: [
      "https://lh3.googleusercontent.com/aida/AP1WRLtYUW-Vc7nSagdGIsLWiUqUrlzb_s9R39aUUG1zd7Bb07tN6aZiQTkMsGQeM_2Isl3CJb10mA92Jffxof-pjjYIj1HpDJu16YAIXeMgUxU-yr-IR1PG46h5bMPuzrqR-9fn_AwoI1eRuOJeLvqgb1PoXeUPFWnBX4WpuFmzh5ojimVVvzvrxx7bsXSAsH8zLIGlxUSGHnRRCkDIKF3ql9UXdaGhQ-xCOJTrTiRfna3UmChmcbGj2WtRZ9A",
      "https://lh3.googleusercontent.com/aida/AP1WRLt9cwIQbmUJH8fFEJICaVz8ZSavrT0RjEWWzYjnnvkj1otcvm13Qzhhpy1-iSwTW0dPGshlN8zinL5WYaG4HvE7RF4HmGbwG2uaxOeVxa1K5xtodt16_rbbGOysz-ZW0EryBlVmAVWN8Ww4EEep9k3egW-MjZpzJj1WysZ5zgYY62kGlN5XYVu_IYLT4fR4i2YQNuiPXsfKj3ErSs-J2-FtD7PZz166LW-_ABNTpFk68Ak2MwwOoARaFow",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "1.55ct Solitaire • 18k White Gold",
    description: "A masterpiece of modern engineering and heritage craft. The Celestia features a breathtaking 1.55-carat laboratory-grown diamond, held in a signature minimalist setting that invites light from every angle. Each stone is ethically produced in our carbon-neutral laboratory, ensuring your symbol of love leaves no mark on the earth.",
    colorGrade: "D (Colorless)",
    clarity: "VVS1",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Rose Gold", hex: "#E6A08A", title: "18k Rose Gold" },
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" }
    ]
  },
  {
    id: "eclipse-series",
    name: "Eclipse Series Tennis Bracelet",
    category: "Princess Cut",
    metal: "Platinum",
    carat: 8.42,
    price: 12400,
    image: "https://lh3.googleusercontent.com/aida/AP1WRLuMy6eELy3rnyH0o9ec4HdZ5AlLO3yI2qIe282YT03BciGVb8t4cfuVTI7wmDaHA64VRDHKRZ7iv6Y1N8kOxK0pO2tLPPIG2Z_vCyQJEHsJ13nD0Cf6rJ9WAQQoSH2yuWH2zANBpA8aRU60YvtpyIFhfy3pZZKTjGwN86oM-OCVF3SmnwH-bvBbgEHMJqbU37nXJ0j9gnKnuB0eT6X--p_oGTwkCPMAz0PYmlMZpNie3HusO56j8FVfA2A",
    images: [
      "https://lh3.googleusercontent.com/aida/AP1WRLuMy6eELy3rnyH0o9ec4HdZ5AlLO3yI2qIe282YT03BciGVb8t4cfuVTI7wmDaHA64VRDHKRZ7iv6Y1N8kOxK0pO2tLPPIG2Z_vCyQJEHsJ13nD0Cf6rJ9WAQQoSH2yuWH2zANBpA8aRU60YvtpyIFhfy3pZZKTjGwN86oM-OCVF3SmnwH-bvBbgEHMJqbU37nXJ0j9gnKnuB0eT6X--p_oGTwkCPMAz0PYmlMZpNie3HusO56j8FVfA2A",
      "https://lh3.googleusercontent.com/aida/AP1WRLt9cwIQbmUJH8fFEJICaVz8ZSavrT0RjEWWzYjnnvkj1otcvm13Qzhhpy1-iSwTW0dPGshlN8zinL5WYaG4HvE7RF4HmGbwG2uaxOeVxa1K5xtodt16_rbbGOysz-ZW0EryBlVmAVWN8Ww4EEep9k3egW-MjZpzJj1WysZ5zgYY62kGlN5XYVu_IYLT4fR4i2YQNuiPXsfKj3ErSs-J2-FtD7PZz166LW-_ABNTpFk68Ak2MwwOoARaFow"
    ],
    specs: "Tennis Bracelet • Platinum",
    description: "Our signature Eclipse Tennis Bracelet showcases a continuous loop of brilliant princess-cut laboratory diamonds. Meticulously set in solid platinum, it sparkles with peerless brilliance while maintaining a completely zero-carbon footprint.",
    colorGrade: "F (Colorless)",
    clarity: "VS1",
    certification: "IGI Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" },
      { name: "White Gold", hex: "#F5F5F5", title: "18k White Gold" }
    ]
  },
  {
    id: "aurora-pendant",
    name: "Aurora Oval Luxe Pendant",
    category: "Oval Luxe",
    metal: "Yellow Gold",
    carat: 2.10,
    price: 7200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "Drop Necklace • 18k Gold",
    description: "The Aurora Pendant features a magnificent 2.10-carat oval lab-grown diamond held in a bespoke 18k yellow gold setting. Its fluid drop-pendant silhouette captures organic beauty and modern elegance in equal measure.",
    colorGrade: "E (Colorless)",
    clarity: "VVS2",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "Rose Gold", hex: "#E6A08A", title: "18k Rose Gold" },
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" }
    ]
  },
  {
    id: "heritage-bands",
    name: "Heritage Emerald Cut Band Suite",
    category: "Emerald Cut",
    metal: "Rose Gold",
    carat: 0.85,
    price: 3500,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "Wedding Suite • Rose Gold",
    description: "A harmonious wedding band suite with step-cut emerald diamonds set in a soft 18k rose gold band. Hand-polished by master artisans to deliver linear brilliance and timeless character.",
    colorGrade: "G (Near Colorless)",
    clarity: "VS1",
    certification: "IGI Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Rose Gold", hex: "#E6A08A", title: "18k Rose Gold" },
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "White Gold", hex: "#F5F5F5", title: "18k White Gold" }
    ]
  },
  {
    id: "infinity-links",
    name: "Infinity Links Bracelet",
    category: "Oval Luxe",
    metal: "Yellow Gold",
    carat: 5.0,
    price: 9900,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "Modern Bracelet • Yellow Gold",
    description: "The Infinity Links bracelet redefines structural elegance with interlocking 18k yellow gold links set with high-grade oval laboratory diamonds. A modern classic constructed for everyday wear.",
    colorGrade: "F (Colorless)",
    clarity: "VVS2",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" }
    ]
  },
  {
    id: "lumina-drops",
    name: "Lumina Pear Statement Drops",
    category: "Pear Shape",
    metal: "Platinum",
    carat: 12.0,
    price: 15200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ], specs: "Statement Earrings • Platinum",
    description: "These breathtaking drop earrings exhibit matching 6.0-carat pear-shaped diamonds suspended from delicate platinum chains. They offer a luxurious display of pure, eco-friendly light movement.",
    colorGrade: "D (Colorless)",
    clarity: "VVS1",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" },
      { name: "White Gold", hex: "#F5F5F5", title: "18k White Gold" }
    ]
  },
  {
    id: "celestial-solitaire",
    name: "Celestial Solitaire",
    category: "Brilliant Round",
    metal: "Rose Gold",
    carat: 2.5,
    price: 3200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "2.5ct VVS1 • Recycled 18k Rose Gold",
    description: "An ethereal lab-grown solitaire, meticulously designed with micro-prongs to maximize light entrance and fire brilliance. Crafted from certified 100% recycled 18k gold.",
    colorGrade: "E (Colorless)",
    clarity: "VVS1",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Rose Gold", hex: "#E6A08A", title: "18k Rose Gold" },
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" }
    ]
  },
  {
    id: "provenance-studs",
    name: "Provenance Studs",
    category: "Artisan Studs",
    metal: "Platinum",
    carat: 1.0,
    price: 1850,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBom3HeTG-D4UXTRkZr0JvDgX_Pa6lpNbiss7DzkB3fBEeYGC2bowmL1CPXlFcEd5aTY3oAvFvvelGsRN90_jkyAQ5Dmj95WB0MuRkARyHslAnwnJO8WLVnqbs7J8PPiQGWDsaJpewTgMsB9gKWbm29lRT_8-TMH3JBf0D-iHYVPdA4hf8Atd33vlnnZuUtlWfvSsTWSOFkVDg-2QHAznl5v-UL3VNHFClzruXm24opR-0AiKlPV_WcJWPLMVGzOCjjTNVpRBGvaQQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBom3HeTG-D4UXTRkZr0JvDgX_Pa6lpNbiss7DzkB3fBEeYGC2bowmL1CPXlFcEd5aTY3oAvFvvelGsRN90_jkyAQ5Dmj95WB0MuRkARyHslAnwnJO8WLVnqbs7J8PPiQGWDsaJpewTgMsB9gKWbm29lRT_8-TMH3JBf0D-iHYVPdA4hf8Atd33vlnnZuUtlWfvSsTWSOFkVDg-2QHAznl5v-UL3VNHFClzruXm24opR-0AiKlPV_WcJWPLMVGzOCjjTNVpRBGvaQQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "1.0ct t.w. • Artisan Prongs",
    description: "Timeless classic studs boasting surgical perfection and high-grade brilliance. A subtle double-claw setting adds modern charm to zero-carbon synthesized gems.",
    colorGrade: "D (Colorless)",
    clarity: "VS1",
    certification: "GIA Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Platinum", hex: "#E5E4E2", title: "Platinum" },
      { name: "White Gold", hex: "#F5F5F5", title: "18k White Gold" }
    ]
  },
  {
    id: "the-terra-drop",
    name: "The Terra Drop",
    category: "Marquise Cut",
    metal: "Yellow Gold",
    carat: 1.25,
    price: 2400,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEGLDC-9MkDh8yRjviZ1ykmGePsNTLJLmZ76TAz9HqAk3gwEAlFqVhHeqwVNFpS5_OhhFj5yb-cyXh5vbaItkpac9yF6K8p8nkDuVFbhlJMPyWr4IGxPSWCN0xy2zwba1QmmgE_NUy-dKRPNygm2a8X_pvQu921TbA59g8ew6DYiRQGcnbx6p0KkIFL4bJh1NMCAII8Oi29UABapAFFrSV9Aw_mZJmwnHxxBmGFIUAaba1ULLquAN0CAbbpG93vifSvPkNGcwoIQ",
      "https://lh3.googleusercontent.com/aida/AP1WRLvMl8SlFWTmGABEymNfwtbM6TXZO-sIKu0OTXn9EQK6QCwGq-Qt5hdV9ppVB3_cImYtC9Z-xDhL4B8kSVS2uzoXmtV6h4rAm2wl6GN8SQoRkQclnd32pqrq1GKAmLxspwJ_L5r58EMroimOzJFbHC2UMzqy1tSL-F9nUzisx_EF7j_Rs5dbCCB_CNYc1gGdrvWuOWt11YRKFxe2-udukSbafsR5t1ej-oTHovKHUHZkALewxU00J-PJ9g"
    ],
    specs: "Marquise Cut • Hand-Forged",
    description: "A gorgeous marquise pendant that floats gracefully. Hand-forged textured gold setting evokes dry terracotta landscapes and geological formations.",
    colorGrade: "F (Colorless)",
    clarity: "VS1",
    certification: "IGI Certified",
    stoneOrigin: "Eco-Conscious Lab",
    availableMetals: [
      { name: "Yellow Gold", hex: "#E6C978", title: "18k Yellow Gold" },
      { name: "Rose Gold", hex: "#E6A08A", title: "18k Rose Gold" }
    ]
  }
];
