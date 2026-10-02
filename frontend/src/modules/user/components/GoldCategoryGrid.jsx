import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import goldRingsLight from '@assets/categories/gold_rings_light.png';
import goldEarringsLight from '@assets/categories/gold_earrings_light.png';
import goldPendantsLight from '@assets/categories/gold_pendants_light.png';
import goldBracelet from '@assets/categories/gold_bracelet.png';
import catNosepin from '@assets/categories/nosepin.png';
import goldMangalsutraLight from '@assets/categories/gold_mangalsutra_light.png';
import goldBangle from '@assets/categories/gold_bangle.png';
import catSets from '@assets/categories/sets.png';
import catNewLaunch from '@assets/categories/newlaunch.png';

const GOLD_CATEGORIES = [
    { id: 1, name: 'Gold Rings', image: goldRingsLight, path: '/shop?metal=gold&category=rings', badge: '' },
    { id: 2, name: 'Gold Earrings', image: goldEarringsLight, path: '/shop?metal=gold&category=earrings', badge: '' },
    { id: 3, name: 'Gold Pendants', image: goldPendantsLight, path: '/shop?metal=gold&category=necklaces', badge: '' },
    { id: 4, name: 'Gold Bracelets', image: goldBracelet, path: '/shop?metal=gold&category=bracelets', badge: '' },
    { id: 5, name: 'Gold Nose Pins', image: catNosepin, path: '/shop?metal=gold&category=nose-pins', badge: '' },
    { id: 6, name: 'Gold Mangalsutra', image: goldMangalsutraLight, path: '/shop?metal=gold&category=mangalsutras', badge: '' },
    { id: 7, name: 'Gold Bangles', image: goldBangle, path: '/shop?metal=gold&category=bangles', badge: '' },
    { id: 8, name: 'Gold Sets', image: catSets, path: '/shop?metal=gold&category=sets', badge: '' },
    { id: 9, name: 'New Arrivals', image: catNewLaunch, path: '/shop?metal=gold&filter=new', badge: 'New' },
];

const GoldCategoryGrid = ({ sectionData = null }) => {
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const sectionTitle = String(sectionData?.settings?.title || sectionData?.label || 'Shop by Category').trim() || 'Shop by Category';

    const ensureGoldCategoryPath = (rawPath = '', categoryId = '') => {
        const source = String(rawPath || '').trim();
        const normalizedCategoryId = String(categoryId || '').trim();

        if (!source) {
            return normalizedCategoryId
                ? `/shop?metal=gold&category=${encodeURIComponent(normalizedCategoryId)}`
                : '/shop?metal=gold';
        }

        if (!source.startsWith('/shop')) {
            return normalizedCategoryId
                ? `/shop?metal=gold&category=${encodeURIComponent(normalizedCategoryId)}`
                : '/shop?metal=gold';
        }

        const params = new URLSearchParams(source.includes('?') ? source.split('?')[1] : '');
        params.set('metal', 'gold');
        if (normalizedCategoryId) {
            params.set('category', normalizedCategoryId);
        }

        const query = params.toString();
        return `/shop${query ? `?${query}` : ''}`;
    };

    const categories = useMemo(() => {
        const configuredItems = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configuredItems.length === 0) return GOLD_CATEGORIES;

        return configuredItems.map((item, index) => ({
            id: item?.itemId || item?.id || `gold-category-${index + 1}`,
            name: item?.name || item?.label || `Category ${index + 1}`,
            image: resolveLegacyCmsAsset(item?.image, GOLD_CATEGORIES[index % GOLD_CATEGORIES.length]?.image || ''),
            path: ensureGoldCategoryPath(item?.path, item?.categoryId),
            badge: item?.tag || ''
        }));
    }, [sectionData]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            if (maxScroll <= 0) {
                setActiveIndex(0);
                return;
            }
            const percentage = scrollLeft / maxScroll;
            const index = Math.round(percentage * (categories.length - 1));
            setActiveIndex(Math.min(index, categories.length - 1));
        }
    };

    const scrollToDot = (index) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const maxScroll = container.scrollWidth - container.clientWidth;
            const percentage = index / (categories.length - 1 || 1);
            container.scrollTo({
                left: percentage * maxScroll,
                behavior: 'smooth'
            });
            setActiveIndex(index);
        }
    };

    return (
        <section className="w-full bg-brand-pearl py-6 md:py-12 relative group border-b border-brand-border-soft/60">
            <div className="max-w-[1450px] mx-auto px-4 relative">
                {/* Section Header */}
                <div className="flex flex-col items-center justify-center mb-6 md:mb-10 text-center">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-1.5">
                        Exquisite Craftsmanship
                    </span>
                    <div className="flex items-center justify-center gap-3 md:gap-4">
                        <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-brand-champagne/40" />
                        <h2 className="text-[22px] md:text-[32px] font-serif font-normal text-brand-espresso tracking-tight">
                            {sectionTitle}
                        </h2>
                        <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-brand-champagne/40" />
                    </div>
                </div>

                {/* Categories Horizontal Carousel */}
                <div className="-mx-4 overflow-hidden">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto scrollbar-hide gap-3.5 md:gap-6 pb-3 md:pb-5 px-4 md:px-12 snap-x snap-mandatory scroll-smooth"
                    >
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={cat.path}
                                className="flex flex-col items-center group/item cursor-pointer shrink-0 snap-start"
                            >
                                <div className="relative w-[108px] h-[124px] sm:w-[136px] sm:h-[155px] md:w-[178px] md:h-[200px] mb-2.5 md:mb-3.5 overflow-hidden rounded-[14px] md:rounded-[20px] border border-brand-border bg-brand-porcelain group-hover/item:border-brand-champagne group-hover/item:shadow-md transition-all duration-500 shadow-xs">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    {cat.badge ? (
                                        <div className="absolute top-2 right-2 bg-brand-champagne text-white text-[7.5px] md:text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs uppercase font-bold tracking-wider z-10">
                                            {cat.badge}
                                        </div>
                                    ) : null}

                                    {/* Premium Understated Sliding Button */}
                                    <div className="absolute inset-x-0 bottom-0 bg-brand-plum/90 backdrop-blur-xs py-2.5 md:py-3.5 transform translate-y-full group-hover/item:translate-y-0 transition-transform duration-300 ease-out flex items-center justify-center">
                                        <span className="text-[9px] md:text-[10px] font-bold text-brand-champagne-light uppercase tracking-[0.2em] flex items-center gap-1">
                                            Explore <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 text-brand-champagne" />
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[13px] md:text-[15px] font-medium text-brand-espresso group-hover/item:text-brand-champagne transition-colors text-center tracking-tight leading-snug">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Carousel Dots */}
                {categories.length > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-2 md:pt-4">
                        {categories.map((_, idx) => (
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
            </div>
        </section>
    );
};

export default GoldCategoryGrid;
