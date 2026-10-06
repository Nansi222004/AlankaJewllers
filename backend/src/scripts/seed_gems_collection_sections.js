const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const HomepageSection = require('../models/HomepageSection');

const SECTIONS = [
  {
    pageKey: "gems-collection",
    sectionKey: "hero-banners-gems",
    sectionType: "banner",
    label: "Hero Banners",
    isActive: true,
    sortOrder: 1,
    settings: {
      autoplayMs: 4000,
    },
    items: [
      {
        id: "gems-hero-1",
        label: "The Art of Colour",
        name: "Precious Gemstones",
        title: "The Art of Colour",
        subtitle: "Discover vibrant gemstones selected to bring colour, character, and individuality to every jewel.",
        description: "Discover vibrant gemstones selected to bring colour, character, and individuality to every jewel.",
        tag: "Precious Gemstones",
        ctaLabel: "Explore Gems",
        path: "/shop?metal=gems",
        image: "",
      },
    ],
  },
  {
    pageKey: "gems-collection",
    sectionKey: "gems-trust-markers",
    sectionType: "rich-content",
    label: "Gemstone Trust & Certification",
    isActive: true,
    sortOrder: 2,
    settings: {
      title: "Certified Precious Gemstones",
      subtitle: "Every gemstone is ethically sourced, lab-certified, and set in hallmarked gold and fine silver",
      badge: "Gemological Authenticity",
    },
    items: [
      {
        id: "gems-trust-1",
        name: "100% Certified Gemstones",
        label: "100% Certified Gemstones",
        subtitle: "Lab Certified Origin & Authenticity",
        iconName: "ShieldCheck",
      },
      {
        id: "gems-trust-2",
        name: "Ethically Sourced",
        label: "Ethically Sourced",
        subtitle: "Conflict-free and responsibly mined",
        iconName: "Gem",
      },
      {
        id: "gems-trust-3",
        name: "Lifetime Exchange",
        label: "Lifetime Exchange",
        subtitle: "& Transparent Buyback Policy",
        iconName: "RefreshCw",
      },
      {
        id: "gems-trust-4",
        name: "BIS Hallmarked",
        label: "BIS Hallmarked",
        subtitle: "Fine gold and sterling silver settings",
        iconName: "Star",
      },
    ],
  },
  {
    pageKey: "gems-collection",
    sectionKey: "gems-products-listing",
    sectionType: "product-collection",
    label: "Gems Product Showcase",
    isActive: true,
    sortOrder: 3,
    settings: {
      title: "Explore Our Gems Collection",
      subtitle: "Vibrant emeralds, rubies, sapphires, and precious stones handcrafted into timeless heirlooms.",
      eyebrow: "Artisan Gemstone Showcase",
      sourceMode: "dynamic",
      productLimit: 12,
    },
    items: [],
  },
  {
    pageKey: "gems-collection",
    sectionKey: "gems-bespoke-consultation",
    sectionType: "rich-content",
    label: "Bespoke Gemstone Consultation",
    isActive: true,
    sortOrder: 4,
    settings: {
      title: "Commission a Bespoke Gemstone Creation",
      subtitle: "Work with our private atelier to source rare gemstones and craft bespoke custom settings tailored to your vision.",
      badge: "Private Atelier Service",
      whatsappNumber: "919876543210",
      ctaLabel: "Chat on WhatsApp",
      ctaPath: "https://wa.me/919876543210?text=Hello%20Alankarr%20Jewellers,%20I'd%20like%20to%20inquire%20about%20a%20bespoke%20gemstone%20jewellery%20design.",
    },
    items: [],
  },
];

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const sec of SECTIONS) {
      const sectionId = `gems-collection:${sec.sectionKey}`;
      const existing = await HomepageSection.findOne({
        pageKey: 'gems-collection',
        sectionKey: sec.sectionKey
      });

      if (!existing) {
        console.log(`[SEEDING] Creating new section: ${sec.sectionKey}`);
        await HomepageSection.create({
          ...sec,
          sectionId
        });
      } else {
        console.log(`[EXISTING] Updating defaults for: ${sec.sectionKey}`);
        existing.sortOrder = sec.sortOrder;
        existing.label = sec.label;
        if (!existing.items || existing.items.length === 0) {
          existing.items = sec.items;
        }
        if (!existing.settings || Object.keys(existing.settings).length === 0) {
          existing.settings = sec.settings;
        }
        await existing.save();
      }
    }

    const count = await HomepageSection.countDocuments({ pageKey: 'gems-collection' });
    console.log(`\nSuccessfully verified gems-collection sections in DB! Total count: ${count}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding gems sections:', err);
    process.exit(1);
  }
}

run();
