import React, { useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { useHomepageCms } from '../hooks/useHomepageCms';
import { usePublicProductsQuery } from '../hooks/usePublicProductsQuery';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';
import { handleImageError } from '../../../utils/imageFallbacks';
import { matchesRequestedMetal } from '../utils/productMetal';

// Import thematic assets
import themeInfinity from '@assets/theme_infinity.png';
import themeKnots from '@assets/theme_knots.png';
import themeDrops from '@assets/theme_drops.png';
import themeLeaves from '@assets/theme_leaves.png';
import themeBubbles from '@assets/theme_bubbles.png';
import themeMoon from '@assets/theme_moon.png';

const SILVER_STYLE_CATEGORIES = [
    {
        id: 1,
        name: 'Infinity',
        image: themeInfinity,
        path: '/shop?search=Infinity&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M18.18 17.77C17.71 19.12 16.03 20 14.18 20c-1.85 0-3.53-.88-4-2.23L10 17.5c-.17-.18-.32-.38-.45-.6-.13-.22-.24-.45-.33-.7L9 15.5c-1.12-2.12-2.88-3.5-5-3.5-1.1 0-2 .9-2 2s.9 2 2 2c.55 0 1 .45 1 1s-.45 1-1 1c-2.21 0-4-1.79-4-4s1.79-4 4-4c3.08 0 5.62 1.94 6.67 4.5.31.75.76 1.41 1.33 1.93.57.52 1.25.91 2 1.13.75.22 1.5.34 2.25.34 3.31 0 6-2.69 6-6s-2.69-6-6-6c-.75 0-1.5.12-2.25.34-.75.22-1.43.61-2 1.13-.57.52-1.02 1.18-1.33 1.93-.31.75-.85 1.5-1.5 2.13-.65.63-1.45 1.25-2.5 1.87L9.42 16.5C8.97 17.85 7.29 18.73 5.34 18.73c-.55 0-1-.45-1-1s.45-1 1-1c1.1 0 2-.9 2-2s-.9-2-2-2c-2.21 0-4-1.79-4-4s1.79-4 4-4c3.08 0 5.62 1.94 6.67 4.5.31.75.76 1.41 1.33 1.93" />
            </svg>
        )
    },
    {
        id: 2,
        name: 'Knots',
        image: themeKnots,
        path: '/shop?search=Knot&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M10.23,1.75c-0.59-0.59-1.54-0.59-2.12,0L1.75,8.11c-0.59,0.59-0.59,1.54,0,2.12l6.36,6.36 c0.59,0.59,1.54,0.59,2.12,0l6.36-6.36c0.59-0.59,0.59-1.54,0-2.12L10.23,1.75z M13.41,9.17L9.17,13.41L4.93,9.17l4.24-4.24 L13.41,9.17z" />
                <path d="M15.77,5.39c-0.59-0.59-1.54-0.59-2.12,0l-1.06,1.06l2.12,2.12l1.06-1.06C16.35,6.93,16.35,5.97,15.77,5.39z" />
                <path d="M8.23,18.61c0.59,0.59,1.54,0.59,2.12,0l1.06-1.06l-2.12-2.12-1.06,1.06C7.65,17.07,7.65,18.03,8.23,18.61z" />
            </svg>
        )
    },
    {
        id: 3,
        name: 'Water Drops',
        image: themeDrops,
        path: '/shop?search=Drop&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M12,2.5C12,2.5,4,10.6,4,16c0,4.4,3.6,8,8,8s8-3.6,8-8C20,10.6,12,2.5,12,2.5z M12,21c-2.8,0-5-2.2-5-5c0-2,1.5-4.8,5-8.5 c3.5,3.7,5,6.5,5,8.5C17,18.8,14.8,21,12,21z" />
            </svg>
        )
    },
    {
        id: 4,
        name: 'Leaves',
        image: themeLeaves,
        path: '/shop?search=Leaf&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M17,8l-1.4,1.4C14.1,8.1,12.3,7,10,7C6.1,7,3,10.1,3,14c0,3.9,3.1,7,7,7c3.9,0,7-3.1,7-7c0-2.3-1.1-4.1-2.4-5.6L16,7 L17,8z M10,19c-2.8,0-5-2.2-5-5c0-2.8,2.2-5,5-5c2.8,0,5,2.2,5,5C15,16.8,12.8,19,10,19z" />
                <path d="M21,3c-2.2,0-4,1.8-4,4c0,0.7,0.2,1.4,0.5,2l-2,2c-0.3-0.1-0.7-0.1-1-0.1c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4 c0-0.3,0-0.7-0.1-1l2-2c0.6,0.3,1.3,0.5,2,0.5c2.2,0,4-1.8,4-4C25,4.8,23.2,3,21,3z M14.5,14.9c-1,0-1.9-0.8-1.9-1.9 c0-1,0.8-1.9,1.9-1.9s1.9,0.8,1.9,1.9C16.4,14.1,15.5,14.9,14.5,14.9z" />
            </svg>
        )
    },
    {
        id: 5,
        name: 'Bubbles',
        image: themeBubbles,
        path: '/shop?search=Bubble&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <circle cx="16" cy="8" r="4" />
                <circle cx="9" cy="18" r="3" />
                <circle cx="8" cy="7" r="2" />
            </svg>
        )
    },
    {
        id: 6,
        name: 'Moon & Stars',
        image: themeMoon,
        path: '/shop?search=Moon&metal=silver',
        badgeIcon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path d="M12.1,3c-0.1,0-0.2,0-0.3,0c4.5,1.1,7.8,5.2,7.8,10c0,5.7-4.6,10.3-10.3,10.3c-1.2,0-2.4-0.2-3.4-0.6 c1.6,1.4,3.7,2.3,6,2.3c5,0,9-4,9-9C21.1,9.8,17.4,4.9,12.1,3z" />
                <path d="M19,3l0.3,1l1,0.3l-1,0.3l-0.3,1L18.7,4.7l-1-0.3l1-0.3L19,3z" />
            </svg>
        )
    }
];

const SilverCollectionSection = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data: homepageSections = {} } = useHomepageCms();
    const sectionData = homepageSections?.['silver-collection'];

    // Fetch genuine silver products
    const { data: productsData, isLoading } = usePublicProductsQuery(
        {
            metal: 'silver',
            inStockOnly: true,
            sort: 'newest',
            page: 1,
            limit: 8,
        },
        { enabled: true }
    );

    const products = useMemo(() => {
        const rawProducts = productsData?.products || [];
        return rawProducts.filter((product) => matchesRequestedMetal(product, 'silver'));
    }, [productsData?.products]);

    const title = sectionData?.settings?.title || 'Silver Collection';
    const eyebrow = sectionData?.settings?.eyebrow || 'Sterling Masterpieces';
    const subtitle =
        sectionData?.settings?.subtitle ||
        'Explore our handcrafted 925 sterling silver pieces, designed for timeless grace and everyday luxury.';

    const items = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length > 0) {
            return configured.map(item => {
                const defaultMatch = SILVER_STYLE_CATEGORIES.find(d => d.name === item.name || d.id === item.itemId);
                return {
                    id: item.itemId || item.id,
                    name: item.name || item.label || defaultMatch?.name,
                    image: resolveLegacyCmsAsset(item.image, defaultMatch?.image || themeInfinity),
                    path: item.path || defaultMatch?.path || '/shop?metal=silver',
                    badgeIcon: defaultMatch?.badgeIcon
                };
            });
        }
        return SILVER_STYLE_CATEGORIES;
    }, [sectionData?.items]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            if (maxScroll <= 0) {
                setActiveIndex(0);
                return;
            }
            const percentage = scrollLeft / maxScroll;
            const index = Math.round(percentage * (items.length - 1));
            setActiveIndex(Math.min(index, items.length - 1));
        }
    };

    // Respect CMS active toggle
    if (sectionData?.isActive === false) return null;

    return (
        <section className="w-full bg-[#EDE1E5] py-10 md:py-20 overflow-hidden font-sans border-t border-[#D2BBC3]">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                {/* ── SILVER PRODUCTS SHOWCASE (Replacing static atelier banner) ── */}
                <div className="mb-12 md:mb-16">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8 text-left">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2 text-[#C77F94] text-[10px] md:text-[11px] uppercase font-bold tracking-[0.28em]">
                                <AlankarJewelleryMark className="w-3.5 h-3.5 text-[#C77F94]" />
                                <span>{eyebrow}</span>
                            </div>
                            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#3D2730] font-normal tracking-tight">
                                {title}
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-sans max-w-lg">
                                {subtitle}
                            </p>
                        </div>

                        <Link
                            to="/shop?metal=silver"
                            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#6B3F46] hover:text-[#C77F94] transition-colors self-start sm:self-end pb-1 border-b border-[#6B3F46]/30 hover:border-[#C77F94]"
                        >
                            <span>View All Silver</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <ProductSkeleton key={idx} />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id || product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-[#EBD3DA] bg-gradient-to-br from-white via-[#FFF9FA] to-[#FCEFF2] p-8 md:p-12 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7DDE5] text-[#C77F94]">
                                <AlankarJewelleryMark className="h-7 w-7 text-[#C77F94]" />
                            </div>
                            <h3 className="mt-4 font-serif text-xl sm:text-2xl font-medium text-[#3D2730]">
                                Sterling Silver Pieces Coming Soon
                            </h3>
                            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm leading-relaxed text-stone-500">
                                Explore our complete fine jewellery catalogue while our latest 925 sterling silver designs are being updated.
                            </p>
                            <div className="mt-6 flex justify-center">
                                <Link
                                    to="/shop?metal=silver"
                                    className="inline-flex items-center gap-2 bg-[#6B3F46] px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#F7DDE5] transition-all duration-300 hover:bg-[#8E5B63] hover:text-white hover:shadow-md"
                                >
                                    <span>EXPLORE SILVER</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── THEMATIC CARDS SCROLL (Preserved) ── */}
                <div className="relative">
                    <div className="mb-4 text-left">
                        <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-[#C77F94]">
                            Explore by Theme
                        </span>
                    </div>
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto scrollbar-hide gap-4 md:gap-8 pb-6 px-1 snap-x snap-mandatory"
                    >
                        {items.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.06 }}
                                className="flex flex-col items-center group/item cursor-pointer shrink-0 snap-start"
                                onClick={() => navigate(cat.path)}
                            >
                                <div className="relative w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[180px] md:h-[180px] mb-3 overflow-hidden rounded-2xl bg-white border border-[#EBD3DA] group-hover/item:border-[#C77F94] shadow-xs group-hover/item:shadow-[0_12px_28px_rgba(107,63,70,0.12)] transition-all duration-400">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        onError={(e) => handleImageError(e, themeInfinity)}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/item:scale-108"
                                    />
                                    {cat.badgeIcon && (
                                        <div className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 bg-[#6B3F46]/90 backdrop-blur-xs rounded-full flex items-center justify-center text-[#F7DDE5] z-10 border border-[#D99AAE]/50 shadow-sm">
                                            {cat.badgeIcon}
                                        </div>
                                    )}
                                </div>

                                <span className="text-[12px] md:text-[14px] font-serif font-medium text-[#3D2730] group-hover/item:text-[#C77F94] transition-colors text-center truncate max-w-[120px] sm:max-w-[150px]">
                                    {cat.name}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SilverCollectionSection;
