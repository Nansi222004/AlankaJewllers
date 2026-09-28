import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Star,
  Gem,
  ArrowRight,
  MessageCircle,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { useShop } from "../../../context/ShopContext";
import { usePublicCmsPage } from "../hooks/usePublicCmsPage";
import PromoSlider from "../components/PromoSlider";
import ProductCard from "../components/ProductCard";
import Loader from "../../shared/components/Loader";
import { isGemProduct, getGemstoneType, VALID_GEMSTONES } from "../utils/productMetal";
import { resolveLegacyCmsAsset } from "../utils/legacyCmsAssets";

import heroGemstones from "@assets/hero/precious_gemstones_art_of_colour.jpg";

const DEFAULT_GEMS_HERO_SLIDES = [
  {
    id: "gems-hero-default-1",
    image: heroGemstones,
    title: "The Art of Colour",
    subtitle:
      "Discover vibrant gemstones selected to bring colour, character, and individuality to every jewel.",
    tag: "Precious Gemstones",
    ctaLabel: "Explore Gems",
    link: "#gems-grid",
  },
];

const TRUST_BADGES = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "100% Certified",
    subtitle: "Lab Verified Gemstones",
    description: "Every gemstone undergoes rigorous gemological testing and laboratory certification for authenticity.",
  },
  {
    id: 2,
    icon: Gem,
    title: "Ethically Sourced",
    subtitle: "Conflict-Free Origins",
    description: "Hand-selected from responsible artisanal mines worldwide with full provenance tracking.",
  },
  {
    id: 3,
    icon: RefreshCw,
    title: "Lifetime Exchange",
    subtitle: "& Transparent Buyback",
    description: "Enjoy guaranteed upgrade and buyback value on all fine gemstone creations at prevailing rates.",
  },
  {
    id: 4,
    icon: Star,
    title: "BIS Hallmarked",
    subtitle: "Fine Precious Settings",
    description: "Set exclusively in certified 18K/22K solid gold and 925 sterling silver hallmarked by BIS.",
  },
];

const GEMSTONE_GUIDE_ITEMS = [
  {
    name: "Royal Emerald",
    color: "from-emerald-950 to-emerald-800",
    accent: "#10B981",
    description: "Celebrated for centuries as the gem of kings, prized for its vivid verdant hues and natural 'jardin' inclusions.",
  },
  {
    name: "Pigeon Blood Ruby",
    color: "from-rose-950 to-rose-900",
    accent: "#F43F5E",
    description: "The king of gems, symbolizing passion and royalty with its intense, fire-lit crimson brilliance.",
  },
  {
    name: "Cornflower Sapphire",
    color: "from-blue-950 to-indigo-900",
    accent: "#3B82F6",
    description: "A symbol of celestial wisdom and loyalty, admired for its velvety deep oceanic blue depths.",
  },
  {
    name: "Natural Pearl",
    color: "from-amber-950/90 to-stone-900",
    accent: "#E5CC85",
    description: "Organic treasures of timeless grace, offering a warm iridescent lustre and luminous glow.",
  },
];

const GemsJewelleryPage = () => {
  const { products = [], isLoading: isShopLoading } = useShop();
  const {
    data: sections = [],
    isLoading: isCmsLoading,
    isError: isCmsError,
    error: cmsError,
    refetch,
  } = usePublicCmsPage("gems-collection");

  const [selectedGemType, setSelectedGemType] = useState("all");

  useEffect(() => {
    document.title = "Shop Precious Gemstones Jewellery | The Art of Colour | Alankar Jewellers";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sectionMap = useMemo(
    () =>
      (sections || []).reduce((acc, section) => {
        const key = section.sectionKey || section.sectionId;
        if (key) acc[key] = section;
        return acc;
      }, {}),
    [sections],
  );

  // Dynamic Hero Slides from CMS or luxury fallback
  const heroSlides = useMemo(() => {
    const heroSection = sectionMap["hero-banners-gems"];
    const configuredItems = Array.isArray(heroSection?.items) ? heroSection.items : [];
    const validConfigured = configuredItems.filter(
      (item) => item?.label || item?.name || item?.image,
    );

    if (validConfigured.length > 0) {
      return validConfigured.map((item, index) => {
        const fallbackSlide = DEFAULT_GEMS_HERO_SLIDES[index % DEFAULT_GEMS_HERO_SLIDES.length];
        return {
          id: item.itemId || item.id || `gems-hero-${index + 1}`,
          image: resolveLegacyCmsAsset(item.image, fallbackSlide.image) || fallbackSlide.image,
          mobileImage: item.mobileImage ? resolveLegacyCmsAsset(item.mobileImage, null) : null,
          title: String(item?.label || item?.title || fallbackSlide.title).trim(),
          subtitle: String(item?.subtitle || item?.description || fallbackSlide.subtitle).trim(),
          tag: String(item?.name || item?.tag || fallbackSlide.tag).trim(),
          ctaLabel: String(item?.ctaLabel || fallbackSlide.ctaLabel).trim(),
          link: item?.path || fallbackSlide.link,
        };
      });
    }

    return DEFAULT_GEMS_HERO_SLIDES;
  }, [sectionMap]);

  const autoplayMs = Number(sectionMap["hero-banners-gems"]?.settings?.autoplayMs) || 4000;

  // Filter verified Gemstone products from MongoDB catalogue
  const gemProducts = useMemo(() => {
    return (products || []).filter((p) => isGemProduct(p));
  }, [products]);

  // Gemstone categories that actually have inventory
  const availableGemTypes = useMemo(() => {
    const typesSet = new Set();
    gemProducts.forEach((p) => {
      const type = getGemstoneType(p);
      if (type) typesSet.add(type.toLowerCase());
    });
    return Array.from(typesSet);
  }, [gemProducts]);

  // Filtered by selected gem category
  const filteredProducts = useMemo(() => {
    if (selectedGemType === "all") return gemProducts;
    return gemProducts.filter((p) => {
      const type = getGemstoneType(p);
      return type && type.toLowerCase() === selectedGemType.toLowerCase();
    });
  }, [gemProducts, selectedGemType]);

  const trustBadges = useMemo(() => {
    const trustSection = sectionMap["gems-trust-markers"];
    const configured = Array.isArray(trustSection?.items) ? trustSection.items : [];
    if (configured.length === 0) return TRUST_BADGES;

    const iconLookup = {
      ShieldCheck,
      RefreshCw,
      Star,
      Gem,
      Sparkles,
      CheckCircle2,
    };

    return configured.map((item, idx) => ({
      id: item?.itemId || item?.id || `gems-trust-${idx + 1}`,
      icon:
        iconLookup[item.iconName] ||
        iconLookup[item.iconKey] ||
        TRUST_BADGES[idx % TRUST_BADGES.length].icon,
      title: item.name || item.label || TRUST_BADGES[idx % TRUST_BADGES.length].title,
      subtitle: item.subtitle || TRUST_BADGES[idx % TRUST_BADGES.length].subtitle,
      description: item.description || TRUST_BADGES[idx % TRUST_BADGES.length].description,
    }));
  }, [sectionMap]);

  if ((isCmsLoading || isShopLoading) && gemProducts.length === 0 && sections.length === 0) {
    return <Loader />;
  }

  if (isCmsError && gemProducts.length === 0 && sections.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-6 py-14">
        <div className="max-w-xl w-full bg-white border border-stone-200 rounded-3xl p-8 shadow-sm text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-[#FAFBFD] text-[#171717] text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A04A]" />
            <span>Precious Gemstones</span>
          </div>
          <h1 className="mt-2 text-2xl font-serif font-medium text-stone-900">
            Unable to load Gems collection
          </h1>
          <p className="mt-3 text-sm text-stone-600 font-light">
            {cmsError?.response?.data?.message || cmsError?.message || "Please check your network and try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#171717] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#C6A04A] hover:text-[#171717] transition-all cursor-pointer shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen font-sans text-stone-900 selection:bg-[#C6A04A] selection:text-[#171717] overflow-x-hidden">
      {/* 1. Dedicated Luxury Gems Hero Section */}
      <PromoSlider externalSlides={heroSlides} autoplayInterval={autoplayMs} />

      {/* 2. Collection Product Showcase / Grid */}
      <section id="gems-grid" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#E8E0D2] bg-white text-[#C6A04A] text-[10.5px] font-bold uppercase tracking-[0.25em] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A04A]" />
            <span>Precious Gemstones</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#141211] tracking-tight font-normal">
            The Gems Edit
          </h2>
          <p className="mt-3 text-stone-600 text-sm md:text-base font-light leading-relaxed">
            Handcrafted fine jewellery celebrating rare emeralds, rubies, sapphires, and precious stones, meticulously set to elevate every moment.
          </p>
          <div className="w-12 h-[1px] bg-[#C59B27] mx-auto mt-6 opacity-60" />
        </div>

        {/* Dynamic Category Filter Pills (ONLY displayed if matching product inventory exists) */}
        {availableGemTypes.length > 0 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
            <button
              onClick={() => setSelectedGemType("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedGemType === "all"
                  ? "bg-[#171717] text-white shadow-sm"
                  : "bg-white text-stone-600 border border-[#E8E0D2] hover:border-[#C6A04A] hover:text-[#171717]"
              }`}
            >
              All Gems ({gemProducts.length})
            </button>
            {availableGemTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedGemType(type)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider capitalize transition-all duration-200 ${
                  selectedGemType === type
                    ? "bg-[#171717] text-white shadow-sm"
                    : "bg-white text-stone-600 border border-[#E8E0D2] hover:border-[#C6A04A] hover:text-[#171717]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {/* Product Cards Grid or Luxury Coming Soon Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          /* Premium Empty State */
          <div className="bg-white rounded-3xl border border-[#E8E0D2] p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-[0_4px_24px_rgba(23,23,23,0.03)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full pointer-events-none opacity-60" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-50 to-transparent rounded-tr-full pointer-events-none opacity-40" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E8E0D2] flex items-center justify-center mx-auto mb-6 shadow-xs">
                <Gem className="w-7 h-7 text-[#C6A04A]" />
              </div>

              <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C6A04A] mb-2">
                Atelier Curation
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#141211] font-medium tracking-tight mb-4">
                Gems Collection Coming Soon
              </h3>

              <p className="text-stone-600 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed mb-8">
                Our gemstone collection is being carefully curated. Discover our other fine jewellery collections while we prepare the Gems edit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#171717] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C6A04A] hover:text-[#171717] transition-all duration-300 shadow-sm"
                >
                  <span>Explore All Jewellery</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/919876543210?text=Hello%20Alankar%20Jewellers,%20I'm%20interested%20in%20custom%20gemstone%20jewellery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#E8E0D2] text-[#171717] text-xs font-bold uppercase tracking-widest hover:border-[#C6A04A] transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Custom Gem Inquiries</span>
                </a>
              </div>

              {/* Quick links to existing fine jewellery collections */}
              <div className="mt-12 pt-8 border-t border-[#E8E0D2] grid grid-cols-3 gap-3 max-w-md mx-auto">
                <Link
                  to="/gold-collection"
                  className="p-3 rounded-2xl bg-[#FAF8F5] hover:bg-amber-50/70 border border-[#E8E0D2] transition-colors text-center group"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#171717] group-hover:text-[#C6A04A]">
                    Gold
                  </span>
                  <span className="text-[10px] text-stone-500">22K & 18K Pure</span>
                </Link>

                <Link
                  to="/silver-collection"
                  className="p-3 rounded-2xl bg-[#FAF8F5] hover:bg-slate-50 border border-[#E8E0D2] transition-colors text-center group"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#171717] group-hover:text-[#C6A04A]">
                    Silver
                  </span>
                  <span className="text-[10px] text-stone-500">925 Sterling</span>
                </Link>

                <Link
                  to="/diamond-collection"
                  className="p-3 rounded-2xl bg-[#FAF8F5] hover:bg-sky-50/70 border border-[#E8E0D2] transition-colors text-center group"
                >
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#171717] group-hover:text-[#C6A04A]">
                    Diamond
                  </span>
                  <span className="text-[10px] text-stone-500">Certified Brilliance</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. The World of Precious Gemstones / Educational Pillar Strip */}
      <section className="py-16 md:py-20 bg-white border-y border-[#E8E0D2] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#C6A04A]">
              Atelier Heritage
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#141211] mt-2 font-normal">
              The Spectrum of Precious Gems
            </h2>
            <p className="mt-3 text-stone-600 text-sm font-light">
              Each gemstone possesses unique geological rarity, vibrant optical fire, and enduring cultural prestige.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GEMSTONE_GUIDE_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#E8E0D2] hover:border-[#C6A04A]/60 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold shadow-xs"
                  style={{ backgroundColor: item.accent }}
                >
                  <Gem className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#141211] mb-2 group-hover:text-[#C6A04A] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Gemstone Trust & Certification Strip */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#C6A04A]">
            The Alankar Guarantee
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-[#141211] mt-2 font-normal">
            Certified Gemological Trust
          </h2>
          <p className="mt-3 text-stone-600 text-sm font-light">
            Every gemstone piece is accompanied by rigorous authentication and ethical provenance certification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustBadges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="bg-white rounded-2xl p-6 border border-[#E8E0D2] text-center shadow-xs hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E0D2] flex items-center justify-center mx-auto mb-4 text-[#C6A04A]">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-medium text-[#141211] mb-1">
                  {badge.title}
                </h3>
                <div className="text-xs font-semibold text-[#C6A04A] uppercase tracking-wider mb-2">
                  {badge.subtitle}
                </div>
                {badge.description && (
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    {badge.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Bespoke Gemstone Concierge Banner */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#171717] via-[#221D1E] to-[#171717] rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl border border-stone-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5CC85] block mb-3">
              Private Atelier Service
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight mb-4">
              Commission a Bespoke Gemstone Creation
            </h2>
            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-8">
              Looking for a specific carat weight, rare colour saturation, or unique heritage setting? Consult directly with our master gemologists to source and custom-craft your vision.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hello%20Alankar%20Jewellers,%20I'd%20like%20to%20inquire%20about%20a%20bespoke%20gemstone%20jewellery%20design."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#C6A04A] to-[#E5CC85] text-[#171717] text-xs font-bold uppercase tracking-widest hover:opacity-95 transition-all shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GemsJewelleryPage;
