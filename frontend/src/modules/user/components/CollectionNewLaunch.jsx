import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { usePublicProductsQuery } from "../hooks/usePublicProductsQuery";

const COLLECTION_LABELS = {
  gold: "Gold",
  silver: "Silver",
  diamond: "Diamond",
  gems: "Gems",
};

const CollectionNewLaunch = ({ metal, sectionData = null, limit = 8 }) => {
  const normalizedMetal = String(metal || "").trim().toLowerCase();
  const label = COLLECTION_LABELS[normalizedMetal] || "Jewellery";
  const { data, isLoading, isError } = usePublicProductsQuery(
    {
      metal: normalizedMetal,
      tags: "isNewLaunch",
      inStockOnly: true,
      sort: "newest",
      page: 1,
      limit,
    },
    { enabled: Boolean(normalizedMetal) && sectionData?.isActive !== false },
  );

  if (sectionData?.isActive === false || isError) return null;

  const products = data?.products || [];
  if (!isLoading && products.length === 0) return null;

  const ribbonLabel = sectionData?.settings?.ribbonLabel || "NEW LAUNCH";
  const title = sectionData?.settings?.title || `${label} New Launch`;
  const subtitle =
    sectionData?.settings?.subtitle ||
    sectionData?.settings?.offerText ||
    `The newest additions to our ${label.toLowerCase()} collection`;

  return (
    <section
      id={`${normalizedMetal}-new-launch`}
      className="w-full overflow-hidden border-y border-brand-border bg-brand-porcelain py-9 md:py-12"
    >
      <div className="container mx-auto max-w-[1450px] px-4 md:px-8">
        <div className="mb-7 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="bg-brand-plum px-5 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-champagne-light md:px-7">
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
            to={`/shop?metal=${encodeURIComponent(normalizedMetal)}&tags=isNewLaunch`}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-plum transition-colors hover:text-brand-champagne"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 gap-y-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CollectionNewLaunch;
