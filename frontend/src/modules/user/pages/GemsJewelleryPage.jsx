import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Gem, MessageCircle, RefreshCw, ShieldCheck, Sparkles, Star } from "lucide-react";
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
    const iconMap = { ShieldCheck, Gem, RefreshCw, Star, Sparkles };
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
    <div className="min-h-screen overflow-x-hidden bg-white font-body text-brand-espresso">
      {isActive(sectionMap["hero-banners-gems"]) && (
        <PromoSlider
          externalSlides={heroSlides}
          autoplayInterval={Number(sectionMap["hero-banners-gems"]?.settings?.autoplayMs) || 4000}
          compact
        />
      )}

      <section className="border-b border-brand-border-soft bg-brand-pearl px-4 py-7 text-center sm:py-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-champagne">
          Precious Gemstones
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-brand-espresso sm:text-4xl">
          Gems Collection
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-taupe sm:text-base">
          Discover gemstone jewellery selected for colour, character and timeless beauty.
        </p>
      </section>

      <GemsCollectionGrid
        sectionData={sectionMap["gems-collection-grid"] || {}}
      />

      <CollectionNewLaunch
        metal="gems"
        sectionData={sectionMap["gems-new-launch"]}
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
        <section className="border-y border-brand-border-soft bg-brand-pearl px-4 py-10 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-champagne">
                {trustSection?.settings?.eyebrow || "The Alankar Promise"}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-brand-espresso sm:text-3xl">
                {trustSection?.settings?.title || "Gemstone Trust & Service"}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="border border-brand-border bg-brand-white p-4 text-center sm:p-6">
                    <Icon className="mx-auto h-5 w-5 text-brand-champagne" />
                    <h3 className="mt-3 font-serif text-base text-brand-espresso">{item.name}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-brand-taupe">{item.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isActive(bespokeSection) && (
        <section className="bg-brand-porcelain px-4 py-10 sm:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <MessageCircle className="h-5 w-5 text-brand-champagne" />
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-champagne">
              {bespokeSection?.settings?.eyebrow || "Bespoke Service"}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-brand-espresso sm:text-3xl">
              {bespokeSection?.settings?.title || "Create a Personal Gemstone Piece"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-taupe">
              {bespokeSection?.settings?.subtitle || "Speak with our team about a gemstone creation made around your story."}
            </p>
            <Link
              to={bespokeSection?.settings?.ctaPath || "/contact"}
              className="mt-6 inline-flex items-center justify-center bg-brand-plum px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-champagne hover:text-brand-espresso"
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
