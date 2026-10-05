import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Gem } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { usePublicProductsQuery } from "../hooks/usePublicProductsQuery";

const COLLECTION_LABELS = {
  gold: "Gold",
  silver: "Silver",
  diamond: "Diamond",
  gems: "Gems",
};

const CollectionNewLaunch = ({
  collection,
  material,
  metal,
  sectionData = null,
  limit = 8,
  showEmptyState = false,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  emptyCtaLink,
}) => {
  const effectiveCollection = String(collection || material || metal || "").trim().toLowerCase();
  const label = COLLECTION_LABELS[effectiveCollection] || "Jewellery";

  const { data, isLoading, isError } = usePublicProductsQuery(
    {
      metal: effectiveCollection,
      tags: "isNewLaunch",
      inStockOnly: true,
      sort: "newest",
      page: 1,
      limit,
    },
    { enabled: Boolean(effectiveCollection) && sectionData?.isActive !== false },
  );

  const rawProducts = data?.products || [];

  // Defensive validation: Gems collection must strictly exclude Mala or Kundan alloy items
  const products = useMemo(() => {
    if (effectiveCollection === "gems") {
      return rawProducts.filter((product) => {
        const text = `${product?.name || ""} ${product?.material || ""} ${product?.category || ""}`.toLowerCase();
        if (/mala|kundan|plated|alloy|imitation/.test(text)) return false;
        return true;
      });
    }
    return rawProducts;
  }, [rawProducts, effectiveCollection]);

  const shouldRenderEmptyState = showEmptyState || effectiveCollection === "gems";

  if (sectionData?.isActive === false || isError) return null;
  if (!isLoading && products.length === 0 && !shouldRenderEmptyState) return null;

  const ribbonLabel = sectionData?.settings?.ribbonLabel || "NEW LAUNCH";
  const title =
    sectionData?.settings?.title ||
    (effectiveCollection === "gems" ? "Gems New Launch" : `${label} New Launch`);
  const subtitle =
    sectionData?.settings?.subtitle ||
    sectionData?.settings?.offerText ||
    (effectiveCollection === "gems"
      ? "Discover the newest additions to our gemstone collection."
      : `The newest additions to our ${label.toLowerCase()} collection`);

  const viewAllLink = `/shop?metal=${encodeURIComponent(effectiveCollection)}&tags=isNewLaunch`;

  const themeConfig = {
    gold: {
      sectionBg: "border-y border-brand-border bg-brand-porcelain",
      ribbonBg: "bg-brand-plum text-brand-champagne-light",
      viewAllText: "text-brand-plum hover:text-brand-champagne",
    },
    silver: {
      sectionBg: "border-y border-[#E9DEDA] bg-gradient-to-b from-[#FBF8F7] to-white",
      ribbonBg: "bg-gradient-to-r from-[#6B3F46] to-[#8E5B63] text-[#F1DFDE]",
      viewAllText: "text-[#6B3F46] hover:text-[#C98F96]",
    },
    diamond: {
      sectionBg: "border-y border-[#D4E0ED] bg-gradient-to-b from-[#F2F6FA] to-white",
      ribbonBg: "bg-[#0F2038] text-[#E0EAFC]",
      viewAllText: "text-[#1E3A5F] hover:text-[#0F2038]",
    },
    gems: {
      sectionBg: "border-y border-[#C8DFD5] bg-gradient-to-b from-[#F0F7F4] to-white",
      ribbonBg: "bg-[#0D3B2E] text-[#E3F5EC]",
      viewAllText: "text-[#185A44] hover:text-[#0D3B2E]",
    },
  }[effectiveCollection] || {
    sectionBg: "border-y border-brand-border bg-brand-porcelain",
    ribbonBg: "bg-brand-plum text-brand-champagne-light",
    viewAllText: "text-brand-plum hover:text-brand-champagne",
  };

  return (
    <section
      id={`${effectiveCollection}-new-launch`}
      className={`w-full overflow-hidden py-9 md:py-12 ${themeConfig.sectionBg}`}
    >
      <div className="container mx-auto max-w-[1450px] px-4 md:px-8">
        <div className="mb-7 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.24em] md:px-7 ${themeConfig.ribbonBg}`}>
              {ribbonLabel}
            </span>
            <div className="min-w-0 text-center sm:text-left">
              <h2 className="font-serif text-2xl font-medium text-brand-espresso md:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-xs text-brand-taupe md:text-sm">{subtitle}</p>
            </div>
          </div>

          <Link
            to={viewAllLink}
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${themeConfig.viewAllText}`}
          >
            VIEW ALL
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 gap-y-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-brand-champagne/30 bg-gradient-to-b from-brand-pearl/80 via-white to-brand-porcelain p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-champagne-mist text-brand-champagne">
              <Gem className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-medium text-brand-espresso md:text-2xl">
              {emptyTitle || (effectiveCollection === "gems" ? "New Gemstone Pieces Coming Soon" : "New Pieces Coming Soon")}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-brand-taupe md:text-sm">
              {emptyDescription || (effectiveCollection === "gems" ? "Explore our curated gemstone collection while our latest pieces are being prepared." : "Explore our curated collection while our latest pieces are being prepared.")}
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to={emptyCtaLink || (effectiveCollection === "gems" ? "#gems-products" : `/shop?metal=${encodeURIComponent(effectiveCollection)}`)}
                onClick={(e) => {
                  const targetLink = emptyCtaLink || (effectiveCollection === "gems" ? "#gems-products" : "");
                  if (targetLink.startsWith("#")) {
                    const target = document.querySelector(targetLink);
                    if (target) {
                      e.preventDefault();
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className="inline-flex items-center gap-2 bg-brand-plum px-7 py-3 text-xs font-bold uppercase tracking-widest text-brand-champagne-light transition-all duration-300 hover:bg-brand-champagne hover:text-brand-espresso hover:shadow-md"
              >
                {emptyCtaLabel || (effectiveCollection === "gems" ? "EXPLORE GEMS" : "EXPLORE COLLECTION")}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionNewLaunch;
