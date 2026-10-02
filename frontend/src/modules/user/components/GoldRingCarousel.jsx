import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import ringLight from '@assets/categories/gold_rings_light.png';

const fallbackRingTypes = [
    { id: 1, name: 'Solitaire Ring', image: ringLight, path: '/shop?category=Rings&search=solitaire' },
    { id: 2, name: 'Promise Ring', image: ringLight, path: '/shop?category=Rings&search=promise' },
    { id: 3, name: '9kt Ring', image: ringLight, path: '/shop?category=Rings&search=9kt' },
    { id: 4, name: 'Vanki Ring', image: ringLight, path: '/shop?category=Rings&search=vanki' },
    { id: 5, name: 'Rose Gold Ring', image: ringLight, path: '/shop?category=Rings&search=rose-gold' },
    { id: 6, name: 'Classic Ring', image: ringLight, path: '/shop?category=Rings&search=classic' },
];

const ensureGoldPath = (rawPath = '', categoryId = '') => {
    const normalizedCategoryId = String(categoryId || '').trim();
    if (normalizedCategoryId) return `/shop?metal=gold&category=${encodeURIComponent(normalizedCategoryId)}`;

    const source = String(rawPath || '').trim();
    if (!source) return '/shop?metal=gold';
    if (!source.startsWith('/shop')) return source;
    if (/([?&])metal=gold(&|$)/i.test(source)) return source;
    return `${source}${source.includes('?') ? '&' : '?'}metal=gold`;
};

const GoldRingCarousel = ({ sectionData = null }) => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const ringTypes = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length === 0) return fallbackRingTypes;

        return configured.map((item, idx) => ({
            id: item?.itemId || item?.id || `gold-ring-${idx + 1}`,
            name: item?.name || item?.label || fallbackRingTypes[idx % fallbackRingTypes.length].name,
            image: resolveLegacyCmsAsset(item?.image, fallbackRingTypes[idx % fallbackRingTypes.length].image),
            path: ensureGoldPath(item?.path || fallbackRingTypes[idx % fallbackRingTypes.length].path, item?.categoryId)
        }));
    }, [sectionData]);

    const title = String(sectionData?.settings?.title || sectionData?.label || 'Get The Right Ring').trim() || 'Get The Right Ring';
    const ctaLabel = String(sectionData?.settings?.ctaLabel || 'View All Rings').trim() || 'View All Rings';
    const ctaPath = ensureGoldPath(String(sectionData?.settings?.ctaPath || '/shop?metal=gold&category=rings').trim() || '/shop?metal=gold&category=rings');

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            if (maxScroll <= 0) {
                setActiveIndex(0);
                return;
            }
            const percentage = scrollLeft / maxScroll;
            const index = Math.round(percentage * (ringTypes.length - 1));
            setActiveIndex(Math.min(index, ringTypes.length - 1));
        }
    };

    const scrollToDot = (index) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const maxScroll = container.scrollWidth - container.clientWidth;
            const percentage = index / (ringTypes.length - 1 || 1);
            container.scrollTo({
                left: percentage * maxScroll,
                behavior: 'smooth'
            });
            setActiveIndex(index);
        }
    };

    return (
        <section className="w-full py-8 md:py-14 bg-brand-pearl/50 border-b border-brand-border-soft/60">
            <div className="max-w-[1450px] mx-auto px-4 md:px-6">
                <div className="text-center mb-8 md:mb-10">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-1.5 block">
                        Signature Silhouettes
                    </span>
                    <h2 className="text-2xl md:text-4xl font-serif text-brand-espresso font-normal tracking-tight">
                        {title}
                    </h2>
                    <div className="h-px w-16 bg-brand-champagne/40 mx-auto mt-3" />
                </div>

                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto scrollbar-hide gap-3.5 md:gap-5 pb-5 snap-x snap-mandatory scroll-smooth px-1"
                >
                    {ringTypes.map((type) => (
                        <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            onClick={() => navigate(type.path)}
                            className="flex-shrink-0 w-[140px] md:w-[180px] lg:w-[205px] snap-start bg-white border border-brand-border rounded-2xl overflow-hidden group cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full p-2.5 sm:p-3"
                        >
                            {/* Image Container - Square and clean */}
                            <div className="relative w-full aspect-square overflow-hidden bg-brand-porcelain rounded-xl border border-brand-border-soft">
                                <img
                                    src={type.image}
                                    alt={type.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>

                            {/* Button Style Label - Light Understated Luxury */}
                            <div className="mt-3 mb-1 px-1">
                                <div className="w-full py-2.5 px-2 bg-brand-pearl group-hover:bg-brand-rosewater/40 border border-brand-border group-hover:border-brand-champagne/60 text-center rounded-xl transition-all duration-300 shadow-2xs">
                                    <span className="text-[10px] md:text-[11px] font-semibold text-brand-plum group-hover:text-brand-espresso uppercase tracking-[0.14em]">
                                        {type.name}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Carousel Dots */}
                {ringTypes.length > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-2 md:pt-4">
                        {ringTypes.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToDot(idx)}
                                className={`transition-all duration-300 rounded-full ${
                                    activeIndex === idx 
                                        ? "w-6 h-1.5 bg-brand-champagne" 
                                        : "w-1.5 h-1.5 bg-brand-border hover:bg-brand-taupe"
                                }`}
                                aria-label={`Go to item ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(ctaPath)}
                        className="bg-brand-plum text-brand-champagne-light hover:bg-brand-espresso font-medium text-[11px] md:text-[13px] px-10 py-3 rounded-full border border-brand-champagne/30 transition-all duration-300 shadow-sm hover:shadow-md tracking-[0.2em] uppercase"
                        type="button"
                    >
                        {ctaLabel}
                    </motion.button>
                </div>
            </div>
        </section>
    );
};

export default GoldRingCarousel;
