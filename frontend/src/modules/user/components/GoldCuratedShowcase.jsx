import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resolveLegacyCmsAsset } from "../utils/legacyCmsAssets";

import ringLight from "@assets/categories/gold_rings_light.png";

const fallbackCollections = [
  {
    id: 1,
    title: "The Gold Standards",
    image: ringLight,
    path: "/shop?category=Rings",
  },
  {
    id: 2,
    title: "Timeless Solitaires",
    image: ringLight,
    path: "/shop?category=Rings&search=solitaire",
  },
  {
    id: 3,
    title: "Shubh Akshaya Tritiya",
    image: ringLight,
    path: "/shop?metal=gold",
  },
  {
    id: 4,
    title: "Alankarrr Heritage",
    image: ringLight,
    path: "/shop?category=Rings&search=vanki",
  },
  {
    id: 5,
    title: "Crafted in Pure Gold",
    image: ringLight,
    path: "/shop?category=Rings&search=solitaire",
  },
  {
    id: 6,
    title: "Luxury Ring Sets",
    image: ringLight,
    path: "/shop?category=Rings&search=classic",
  },
];

const ensureGoldCategoryPath = (path, categoryId = "") => {
  const normalizedCategory = String(categoryId || "").trim();
  const source = String(path || "").trim();
  const queryString =
    source.startsWith("/shop") && source.includes("?")
      ? source.split("?")[1]
      : "";
  const params = new URLSearchParams(queryString);
  params.set("metal", "gold");
  if (normalizedCategory) params.set("category", normalizedCategory);
  const query = params.toString();
  return `/shop${query ? `?${query}` : "?metal=gold"}`;
};

const GoldCuratedShowcase = ({ sectionData = null }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const collections = useMemo(() => {
    const configured = Array.isArray(sectionData?.items)
      ? sectionData.items
      : [];
    if (configured.length === 0) return fallbackCollections;

    return configured.map((item, idx) => ({
      id: item?.itemId || item?.id || `gold-curated-${idx + 1}`,
      title:
        item?.name ||
        item?.label ||
        fallbackCollections[idx % fallbackCollections.length].title,
      image: resolveLegacyCmsAsset(
        item?.image,
        fallbackCollections[idx % fallbackCollections.length].image,
      ),
      path: ensureGoldCategoryPath(
        item?.path ||
        fallbackCollections[idx % fallbackCollections.length].path,
        item?.categoryId,
      ),
    }));
  }, [sectionData]);

  const eyebrow =
    String(sectionData?.settings?.eyebrow || "Curated Highlights").trim() ||
    "Curated Highlights";
  const title =
    String(
      sectionData?.settings?.title ||
      sectionData?.label ||
      "Premium Gold Collections",
    ).trim() || "Premium Gold Collections";

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) {
        setActiveIndex(0);
        return;
      }
      const percentage = scrollLeft / maxScroll;
      const index = Math.round(percentage * (collections.length - 1));
      setActiveIndex(Math.min(index, collections.length - 1));
    }
  };

  const scrollToDot = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const percentage = index / (collections.length - 1 || 1);
      container.scrollTo({
        left: percentage * maxScroll,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  return (
    <section className="py-8 md:py-14 bg-brand-pearl/50 border-b border-brand-border-soft select-none overflow-hidden">
      <div className="w-full">
        <div className="text-center mb-8 md:mb-12 px-4">
          <span className="inline-flex items-center rounded-full border border-brand-border bg-white px-4 py-1.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne shadow-2xs">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-[24px] md:text-[36px] font-serif font-normal text-brand-espresso tracking-tight">
            {title}
          </h2>
          <div className="h-px w-16 bg-brand-champagne/40 mx-auto mt-2.5" />
        </div>

        <div className="relative group/main max-w-[1550px] mx-auto">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-3.5 md:gap-5 pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory px-4"
          >
            {collections.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => navigate(item.path)}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] aspect-[4/5] relative group cursor-pointer overflow-hidden rounded-2xl bg-brand-porcelain snap-start shadow-xs hover:shadow-md border border-brand-border transition-all duration-300"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-95 transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-brand-espresso/85 via-brand-espresso/30 to-transparent transition-opacity" />

                <div className="absolute bottom-5 left-5 right-5 text-white z-10 transition-all duration-300">
                  <div className="flex items-center justify-between group/btn border-b border-white/20 pb-2">
                    <h3 className="text-[11px] md:text-[12px] font-semibold tracking-[0.16em] uppercase leading-tight max-w-[85%] text-brand-pearl">
                      {item.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-brand-champagne transition-transform group-hover/btn:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carousel Dots */}
          {collections.length > 1 && (
            <div className="flex justify-center items-center gap-2 pb-6 mt-[-10px]">
              {collections.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToDot(idx)}
                  className={`transition-all duration-300 rounded-full ${activeIndex === idx
                    ? "w-6 h-1.5 bg-brand-champagne"
                    : "w-1.5 h-1.5 bg-brand-border hover:bg-brand-taupe"
                    }`}
                  aria-label={`Go to item ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
              display: none;
          }
          .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}
      </style>
    </section>
  );
};

export default GoldCuratedShowcase;
