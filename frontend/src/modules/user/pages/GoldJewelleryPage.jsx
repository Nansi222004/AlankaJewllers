import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  Star,
  ArrowRight,
  Truck,
  FileText,
} from "lucide-react";
import GoldExploreCollections from "../components/GoldExploreCollections";
import BestStylesSection from "../components/BestStylesSection";
import GoldCategoryGrid from "../components/GoldCategoryGrid";
import { GoldCollectionGrid } from "../components/CategoryGrid";
import CollectionNewLaunch from "../components/CollectionNewLaunch";
import PromoSlider from "../components/PromoSlider";
import GoldRingCarousel from "../components/GoldRingCarousel";
import GoldTestimonials from "../components/GoldTestimonials";
import CuratedForEveryBond from "../components/CuratedForEveryBond";
import GoldExclusiveLaunch from "../components/GoldExclusiveLaunch";
import GoldLuxuryWithinReach from "../components/GoldLuxuryWithinReach";
import GoldDirectProducts from "../components/GoldDirectProducts";
import GoldTrustStrip from "../components/GoldTrustStrip";
import GoldSilverRates from "../components/GoldSilverRates";
import HeerCustomisationBanner from "../components/HeerCustomisationBanner";
import Loader from "../../shared/components/Loader";
import { resolveLegacyCmsAsset } from "../utils/legacyCmsAssets";
import { usePublicCmsPage } from "../hooks/usePublicCmsPage";
import { useShop } from "../../../context/ShopContext";

import heroGold from "@assets/hero/bridal_royal.png";

const TRUST_BADGES = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "100% Certified Lab",
    subtitle: "Grown Diamonds",
  },
  { id: 2, icon: RefreshCw, title: "Lifetime Exchange", subtitle: "& Buyback" },
  { id: 3, icon: RotateCcw, title: "Easy 15", subtitle: "Days Return" },
  { id: 4, icon: Star, title: "B I S", subtitle: "Hallmark" },
];

const GoldJewelleryPage = () => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const {
    data: sections = [],
    isLoading: isCmsLoading,
    isError,
    error: cmsError,
    refetch,
  } = usePublicCmsPage("gold-collection");

  const { updateActiveMetal } = useShop();

  useEffect(() => {
    document.title = "Shop Gold Jewellery | Alanka Jewellers";
    updateActiveMetal("gold");
  }, [updateActiveMetal]);

  const sectionMap = useMemo(
    () =>
      (sections || []).reduce((acc, section) => {
        const key = section.sectionKey || section.sectionId;
        if (key) acc[key] = section;
        return acc;
      }, {}),
    [sections],
  );

  const heroSlides = useMemo(() => {
    const ensureGoldPath = (rawPath = "") => {
      const source = String(rawPath || "").trim();
      if (!source) return "/shop?metal=gold";
      if (!source.startsWith("/shop")) return source;
      if (/([?&])metal=gold(&|$)/i.test(source)) return source;
      return `${source}${source.includes("?") ? "&" : "?"}metal=gold`;
    };
    const heroSection = sectionMap["hero-banners-gold"];
    const configuredItems = Array.isArray(heroSection?.items)
      ? heroSection.items
      : [];
    const slides = configuredItems
      .filter((item) => item?.label || item?.name || item?.image)
      .filter((item) => {
        const title = String(item?.label || item?.title || '').toLowerCase();
        return !title.includes('unique story in golds') && !title.includes('unique story in gold');
      })
      .map((item, index) => ({
        id: item.itemId || item.id || `gold-hero-${index + 1}`,
        image: resolveLegacyCmsAsset(item.image, heroGold),
        mobileImage: item.mobileImage ? resolveLegacyCmsAsset(item.mobileImage, heroGold) : null,
        title:
          String(item?.label || item?.title || "Akshaya Tritiya").trim() ||
          "Akshaya Tritiya",
        subtitle:
          String(
            item?.subtitle || item?.description || "On all gold jewellery",
          ).trim() || "On all gold jewellery",
        tag:
          String(item?.name || item?.tag || item?.eyebrow || "Shubh").trim() ||
          "Shubh",
        ctaLabel: String(item?.ctaLabel || "Shop Now").trim() || "Shop Now",
        link: ensureGoldPath(item?.path || "/shop?metal=gold"),
      }));

    if (slides.length > 0) return slides;

    return [
      {
        id: "gold-hero-fallback",
        image: heroGold,
        title: "Akshaya Tritiya",
        subtitle: "On all gold jewellery",
        tag: "Shubh",
        ctaLabel: "Shop Now",
        link: "/shop?metal=gold",
      },
    ];
  }, [sectionMap]);

  const autoplayMs = Number(sectionMap["hero-banners-gold"]?.settings?.autoplayMs) || 3000;

  // PromoSlider handles its own state now

  const trustBadges = useMemo(() => {
    const trustSection = sectionMap["gold-trust-markers"];
    const configured = Array.isArray(trustSection?.items)
      ? trustSection.items
      : [];
    if (configured.length === 0) return TRUST_BADGES;

    const iconLookup = {
      ShieldCheck: ShieldCheck,
      RefreshCw: RefreshCw,
      RotateCcw: RotateCcw,
      Star: Star,
      Truck: Truck,
      FileText: FileText,
      gem: ShieldCheck,
      "rotate-ccw": RefreshCw,
      truck: Truck,
      "file-text": FileText,
    };

    return configured.map((item, idx) => ({
      id: item?.itemId || item?.id || `gold-trust-${idx + 1}`,
      icon:
        iconLookup[item.iconName] ||
        iconLookup[item.iconKey] ||
        TRUST_BADGES[idx % TRUST_BADGES.length].icon,
      title:
        item.name ||
        item.label ||
        TRUST_BADGES[idx % TRUST_BADGES.length].title,
      subtitle:
        item.subtitle || TRUST_BADGES[idx % TRUST_BADGES.length].subtitle,
      image: item?.image ? resolveLegacyCmsAsset(item.image, "") : "",
    }));
  }, [sectionMap]);

  if (isCmsLoading) return <Loader />;
  if (isError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-6 py-14">
        <div className="max-w-xl w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
            Gold Collection
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
            Unable to load page content
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {cmsError?.response?.data?.message ||
              cmsError?.message ||
              "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#3E2723] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:opacity-95"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-collection-theme="gold" className="bg-white min-h-screen font-body overflow-x-hidden">
      <PromoSlider externalSlides={heroSlides} autoplayInterval={autoplayMs} />

      <GoldCategoryGrid sectionData={sectionMap["gold-category-grid"]} />
      <GoldCollectionGrid
        sectionData={sectionMap["gold-collection-grid"]}
        sidePanelData={sectionMap["gold-shop-by-colour"]}
      />
      <CollectionNewLaunch
        metal="gold"
        sectionData={sectionMap["gold-new-launch-banner"]}
      />
      <GoldSilverRates metal="gold" />
      <GoldExploreCollections
        sectionData={sectionMap["gold-explore-collections"]}
      />
      <BestStylesSection sectionData={sectionMap["best-styles"]} />

      <div className="w-full bg-white py-6 sm:py-12">
        <div className="container mx-auto px-4 max-w-[1450px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 md:gap-6">
            {trustBadges.map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 rounded-2xl border border-brand-border-soft bg-brand-pearl p-2.5 pr-4 shadow-sm transition-all duration-300 hover:shadow-md sm:gap-5 sm:rounded-[24px] sm:p-2 md:pr-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand-border-soft bg-white shadow-sm sm:h-[70px] sm:w-[70px] sm:rounded-[20px] md:h-[85px] md:w-[85px]">
                  {badge.image ? (
                    <img
                      src={badge.image}
                      alt={badge.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <badge.icon className="h-5 w-5 text-brand-champagne sm:h-7 sm:w-7 md:h-9 md:w-9" />
                  )}
                </div>

                <div className="py-1">
                  <h4
                    className={`font-bold leading-tight text-brand-espresso ${idx === 3 ? "text-[13px] tracking-[0.3em] sm:text-[16px] md:text-[20px]" : "text-[13px] sm:text-[15px] md:text-[17px]"}`}
                  >
                    {badge.title}
                  </h4>
                  <p className="text-[12px] font-medium leading-tight text-brand-taupe sm:text-[15px] md:text-[17px]">
                    {idx === 2 ? "Days Return" : badge.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <GoldExclusiveLaunch sectionData={sectionMap["gold-exclusive-launch"]} />
      <GoldRingCarousel sectionData={sectionMap["gold-ring-carousel"]} />
      <HeerCustomisationBanner />
      <GoldLuxuryWithinReach
        sectionData={sectionMap["gold-luxury-within-reach"]}
      />
      <GoldTestimonials sectionData={sectionMap["gold-testimonials"]} />
      <CuratedForEveryBond sectionData={sectionMap["gold-curated-bond"]} />
      <GoldDirectProducts sectionData={sectionMap["gold-products-listing"] || sectionMap["gold-curated-showcase"]} />
      <GoldTrustStrip />
    </div>
  );
};

export default GoldJewelleryPage;
