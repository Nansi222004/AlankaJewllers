import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Gem, MessageCircle, RefreshCw, ShieldCheck, Star } from "lucide-react";
import AlankarJewelleryMark from "../components/AlankarJewelleryMark";
import { useShop } from "../../../context/ShopContext";
import { usePublicCmsPage } from "../hooks/usePublicCmsPage";
import PromoSlider from "../components/PromoSlider";
import CollectionNewLaunch from "../components/CollectionNewLaunch";
import { GemsCollectionGrid } from "../components/CategoryGrid";
import Shop from "./Shop";
import { resolveLegacyCmsAsset } from "../utils/legacyCmsAssets";
import heroGemstones from "@assets/hero/precious_gemstones_art_of_colour.jpg";

const DEFAULT_HERO = {
  id: "gems-hero-default",
  image: heroGemstones,
  title: "The Art of Colour",
  subtitle: "Discover gemstone jewellery selected for colour, character and timeless beauty.",
  tag: "Precious Gemstones",
  ctaLabel: "Explore Gems",
  link: "#gems-products",
};

const DEFAULT_TRUST_ITEMS = [
  { id: "certified", icon: ShieldCheck, name: "Certified Gemstones", subtitle: "Quality you can trust" },
  { id: "sourced", icon: Gem, name: "Thoughtfully Sourced", subtitle: "Selected with care" },
  { id: "exchange", icon: RefreshCw, name: "Lifetime Exchange", subtitle: "Transparent service" },
  { id: "craft", icon: Star, name: "Fine Craftsmanship", subtitle: "Made by master artisans" },
];

const GemsJewelleryPage = () => {
  const { updateActiveMetal } = useShop();
  const { data: sections = [] } = usePublicCmsPage("gems-collection");

  useEffect(() => {
    document.title = "Gems Collection | Alankar Jewellers";
    updateActiveMetal("gems");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateActiveMetal]);

  const sectionMap = useMemo(
    () =>
      (sections || []).reduce((map, section) => {
        const key = section.sectionKey || section.sectionId;
        if (key) map[key] = section;
        return map;
      }, {}),
    [sections],
  );

  const heroSlides = useMemo(() => {
    const items = sectionMap["hero-banners-gems"]?.items;
    if (!Array.isArray(items) || items.length === 0) return [DEFAULT_HERO];

    return items
      .filter((item) => item?.image || item?.label || item?.title)
      .map((item, index) => ({
        id: item.itemId || item.id || `gems-hero-${index + 1}`,
        image: resolveLegacyCmsAsset(item.image, heroGemstones) || heroGemstones,
        mobileImage: item.mobileImage
          ? resolveLegacyCmsAsset(item.mobileImage, null)
          : null,
        title: String(item.label || item.title || DEFAULT_HERO.title).trim(),
        subtitle: String(item.subtitle || item.description || DEFAULT_HERO.subtitle).trim(),
        tag: String(item.name || item.tag || DEFAULT_HERO.tag).trim(),
        ctaLabel: String(item.ctaLabel || DEFAULT_HERO.ctaLabel).trim(),
        link: item.path || DEFAULT_HERO.link,
      }));
  }, [sectionMap]);

  const productsSection = sectionMap["gems-products-listing"];
  const trustSection = sectionMap["gems-trust-markers"];
  const bespokeSection = sectionMap["gems-bespoke-consultation"];
  const trustItems = useMemo(() => {
    const iconMap = { ShieldCheck, Gem, RefreshCw, Star, Sparkles: AlankarJewelleryMark };
    const items = trustSection?.items;
    if (!Array.isArray(items) || items.length === 0) return DEFAULT_TRUST_ITEMS;
    return items.map((item, index) => ({
      id: item.itemId || item.id || `gems-trust-${index}`,
      icon: iconMap[item.iconName || item.iconKey] || DEFAULT_TRUST_ITEMS[index % DEFAULT_TRUST_ITEMS.length].icon,
      name: item.name || item.label || DEFAULT_TRUST_ITEMS[index % DEFAULT_TRUST_ITEMS.length].name,
      subtitle: item.subtitle || item.description || DEFAULT_TRUST_ITEMS[index % DEFAULT_TRUST_ITEMS.length].subtitle,
    }));
  }, [trustSection]);

  const isActive = (section) => !section || section.isActive !== false;
  const listingTitle = productsSection?.settings?.title || "Gems Collection";

  return (
    <div data-collection-theme="gems" className="min-h-screen overflow-x-hidden bg-white font-body text-brand-espresso">
      {isActive(sectionMap["hero-banners-gems"]) && (
        <PromoSlider
          externalSlides={heroSlides}
          autoplayInterval={Number(sectionMap["hero-banners-gems"]?.settings?.autoplayMs) || 4000}
          compact
        />
      )}

      <section className="border-b border-[#EBD3DA] bg-gradient-to-b from-[#FFF7F9] via-[#FFF7F9] to-white px-4 py-7 text-center sm:py-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9C3F60]">
          Precious Gemstones
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[#702F46] sm:text-4xl">
          Gems Collection
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#2C4A3E] sm:text-base">
          Discover gemstone jewellery selected for colour, character and timeless beauty.
        </p>
      </section>

      <GemsCollectionGrid
        sectionData={sectionMap["gems-collection-grid"] || {}}
      />

      <CollectionNewLaunch
        collection="gems"
        material="gems"
        metal="gems"
        sectionData={sectionMap["gems-new-launch"]}
        showEmptyState={true}
        emptyTitle="New Gemstone Pieces Coming Soon"
        emptyDescription="Explore our curated gemstone collection while our latest pieces are being prepared."
        emptyCtaLabel="EXPLORE GEMS"
        emptyCtaLink="#gems-products"
      />

      <section id="gems-products" className="scroll-mt-36 bg-white pt-2">
        <Shop
          embedded
          collectionMetal="gems"
          collectionTitle={listingTitle}
          emptyTitle="No gemstone pieces found"
          emptyDescription="Explore our other fine jewellery collections while our Gems edit continues to grow."
        />
      </section>

      {isActive(trustSection) && (
        <section className="border-y border-[#E8D9E3] bg-[#FFF7F9] px-4 py-7 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 text-center sm:mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C3F60]">
                {trustSection?.settings?.eyebrow || "The Alankarr Promise"}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-[#702F46] sm:text-3xl">
                {trustSection?.settings?.title || "Gemstone Trust & Service"}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-5">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E8D9E3] bg-white p-3 text-left shadow-sm transition-all hover:border-[#9C3F60] hover:shadow-md sm:block sm:p-6 sm:text-center sm:shadow-none">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E2EFE9] sm:mx-auto">
                      <Icon className="h-4 w-4 text-[#9C3F60] sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[14px] leading-tight text-[#702F46] sm:mt-3 sm:text-base">{item.name}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#4A6357] sm:mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isActive(bespokeSection) && (
        <section className="bg-[#FFF7F9] px-4 py-10 sm:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <MessageCircle className="h-5 w-5 text-[#9C3F60]" />
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C3F60]">
              {bespokeSection?.settings?.eyebrow || "Bespoke Service"}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[#702F46] sm:text-3xl">
              {bespokeSection?.settings?.title || "Create a Personal Gemstone Piece"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3B5448]">
              {bespokeSection?.settings?.subtitle || "Speak with our team about a gemstone creation made around your story."}
            </p>
            <Link
              to={bespokeSection?.settings?.ctaPath || "/contact"}
              className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#702F46] px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#9C3F60]"
            >
              {bespokeSection?.settings?.ctaLabel || "Custom Gem Inquiries"}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default GemsJewelleryPage;
