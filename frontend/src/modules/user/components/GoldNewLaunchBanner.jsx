import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import ringsImg from '@assets/categories/gold_rings_light.png';
import pendantsImg from '@assets/categories/gold_pendants_light.png';
import earringsImg from '@assets/categories/gold_earrings_light.png';

const fallbackCards = [
    { id: 'rings', name: 'Rings', image: ringsImg, path: '/shop?metal=gold&category=rings', highlight: false },
    { id: 'pendants', name: 'Pendants', image: pendantsImg, path: '/shop?metal=gold&category=necklaces', highlight: true },
    { id: 'earrings', name: 'Earrings', image: earringsImg, path: '/shop?metal=gold&category=earrings', highlight: false }
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

const GoldNewLaunchBanner = ({ sectionData = null }) => {
    const navigate = useNavigate();

    const cards = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length === 0) return fallbackCards;

        return configured.slice(0, 3).map((item, idx) => ({
            id: item?.itemId || item?.id || `gold-new-launch-${idx + 1}`,
            name: item?.name || item?.label || fallbackCards[idx % fallbackCards.length].name,
            image: resolveLegacyCmsAsset(item?.image, fallbackCards[idx % fallbackCards.length].image),
            path: ensureGoldPath(item?.path || fallbackCards[idx % fallbackCards.length].path, item?.categoryId),
            highlight: idx === 1
        }));
    }, [sectionData]);

    const headingPrefix = String(sectionData?.settings?.prefix || '9 KT').trim() || '9 KT';
    const headingSuffix = String(sectionData?.settings?.suffix || 'Gold').trim() || 'Gold';
    const subtitle = String(sectionData?.settings?.subtitle || '& Laboratory diamonds').trim() || '& Laboratory diamonds';
    const ctaLabel = String(sectionData?.settings?.ctaLabel || 'Starts at INR 8,000').trim() || 'Starts at INR 8,000';
    const ctaPath = String(sectionData?.settings?.ctaPath || '/shop?metal=gold').trim() || '/shop?metal=gold';
    const ribbon = String(sectionData?.settings?.ribbonLabel || sectionData?.label || 'New Launch').trim() || 'New Launch';

    return (
        <section className="w-full py-8 md:py-12 bg-white">
            <div className="max-w-[1450px] mx-auto px-4 md:px-6">
                <div className="bg-brand-porcelain border border-brand-border rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col lg:flex-row relative min-h-[280px] md:min-h-[320px] shadow-xs">
                    {/* Subtle Luxury Faceted Watermark */}
                    <div className="absolute left-0 top-0 h-full w-full pointer-events-none opacity-20">
                        <svg className="w-[300px] h-[300px] absolute -left-16 -top-16 text-brand-champagne" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                            <polygon points="32,18 68,18 88,44 50,88 12,44" opacity="0.35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="12" y1="44" x2="88" y2="44" opacity="0.3" stroke="currentColor" strokeWidth="1.2" />
                            <polyline points="32,18 50,44 68,18" opacity="0.3" stroke="currentColor" strokeWidth="1.2" />
                            <line x1="50" y1="44" x2="50" y2="88" opacity="0.35" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    </div>

                    {/* Left Editorial Info */}
                    <div className="flex-[1.2] p-6 sm:p-8 md:p-12 flex flex-col justify-center relative z-10">
                        <div className="inline-block bg-white text-brand-champagne border border-brand-border text-[10px] font-bold px-3 py-1 rounded-full mb-3.5 shadow-2xs w-fit uppercase tracking-widest">
                            {ribbon}
                        </div>

                        <div className="mb-5">
                            <h2 className="font-serif leading-none mb-1.5 flex items-baseline gap-1">
                                <span className="text-[30px] md:text-[44px] font-normal text-brand-espresso">{headingPrefix}</span>
                                <span className="text-brand-champagne text-[30px] md:text-[42px] font-normal ml-2">{headingSuffix}</span>
                            </h2>
                            <p className="text-brand-taupe text-[13px] md:text-[15px] tracking-wide font-normal">
                                {subtitle}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate(ctaPath)}
                            className="bg-brand-plum text-brand-champagne-light hover:bg-brand-espresso border border-brand-champagne/30 font-medium text-[11px] md:text-[13px] px-8 py-3 rounded-full w-fit transition-all duration-300 shadow-xs hover:shadow-md tracking-[0.16em] uppercase cursor-pointer"
                            type="button"
                        >
                            {ctaLabel}
                        </button>
                    </div>

                    {/* Right Product Grid */}
                    <div className="flex-1 bg-brand-pearl/60 p-5 sm:p-7 md:p-10 flex items-center justify-center relative z-10 border-t lg:border-t-0 lg:border-l border-brand-border">
                        <div className="grid grid-cols-3 gap-3 md:gap-5 items-center w-full max-w-[550px]">
                            {cards.map((card) => (
                                <div key={card.id} className="flex flex-col items-center group cursor-pointer" onClick={() => navigate(card.path)}>
                                    <motion.div
                                        whileHover={{ scale: 1.04 }}
                                        transition={{ duration: 0.3 }}
                                        className={`relative w-full aspect-[4/5] rounded-[18px] md:rounded-[22px] overflow-hidden border border-brand-border shadow-xs bg-white ${card.highlight ? 'scale-105 ring-2 ring-brand-champagne/40' : 'scale-95'}`}
                                    >
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-brand-espresso/10 group-hover:bg-transparent transition-colors" />
                                    </motion.div>
                                    <span className="text-brand-espresso group-hover:text-brand-champagne font-medium mt-3 tracking-wider uppercase text-[11px] md:text-[12px] transition-colors text-center">
                                        {card.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoldNewLaunchBanner;
