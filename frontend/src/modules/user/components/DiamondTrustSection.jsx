import React, { useMemo } from 'react';
import {
    ShieldCheck,
    RefreshCw,
    RotateCcw,
    Star,
    Award,
    CheckCircle2,
    Gem,
    Truck
} from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';

import trustCertifiedImg from '@assets/trust/trust_certified.png';
import trustExchangeImg from '@assets/trust/trust_exchange.png';
import trustReturnsImg from '@assets/trust/trust_returns.png';
import trustHallmarkImg from '@assets/trust/trust_hallmark.png';
import roundDiamondImg from '@assets/diamonds/round.png';

const ICON_MAP = {
    ShieldCheck,
    RefreshCw,
    RotateCcw,
    Star,
    Award,
    Sparkles: AlankarJewelleryMark,
    CheckCircle2,
    Gem,
    Truck
};

const DEFAULT_TRUST_CARDS = [
    {
        key: 'certified',
        title: '100% Certified',
        subtitle: 'Authentic Diamonds',
        description: 'Every diamond is backed by accredited laboratory certification from IGI, GIA, or SGL with unique laser-inscribed cert serial.',
        image: trustCertifiedImg,
        fallbackImage: roundDiamondImg,
        iconName: 'ShieldCheck',
        tag: 'IGI & GIA Certified'
    },
    {
        key: 'exchange',
        title: 'Lifetime Exchange',
        subtitle: '& Buyback Guarantee',
        description: 'Enjoy guaranteed upgrade and buyback value on your fine diamond jewellery anytime at prevailing transparent market benchmarks.',
        image: trustExchangeImg,
        fallbackImage: trustCertifiedImg,
        iconName: 'RefreshCw',
        tag: 'Guaranteed Value'
    },
    {
        key: 'return',
        title: 'Easy 15 Days Return',
        subtitle: 'No Questions Asked',
        description: 'Experience complete peace of mind with 15-day complimentary returns, exchanges, and 100% insured doorstep pickup across India.',
        image: trustReturnsImg,
        fallbackImage: trustCertifiedImg,
        iconName: 'RotateCcw',
        tag: '100% Insured Transit'
    },
    {
        key: 'hallmark',
        title: 'Hallmark Purity',
        subtitle: 'BIS Stamped Assurance',
        description: 'Every 14K, 18K gold and platinum setting carries the official BIS Hallmark stamp guaranteeing government-verified precious metal purity.',
        image: trustHallmarkImg,
        fallbackImage: trustCertifiedImg,
        iconName: 'Star',
        tag: 'BIS Hallmarked'
    }
];

const DiamondTrustSection = ({ sectionData }) => {
    const settings = sectionData?.settings || {};
    const title = settings.title || 'The Alankarr Assurance';
    const subtitle = settings.subtitle || 'Every diamond comes with verified grading, lifetime care, and absolute purity.';
    const badge = settings.badge || 'Certified Trust';

    const cards = useMemo(() => {
        if (!Array.isArray(sectionData?.items) || sectionData.items.length === 0) {
            return DEFAULT_TRUST_CARDS;
        }

        return sectionData.items.slice(0, 4).map((item, idx) => {
            const fallback = DEFAULT_TRUST_CARDS[idx] || DEFAULT_TRUST_CARDS[0];
            const rawId = (item.itemId || item.id || item.name || '').toLowerCase();

            let matchedFallback = fallback;
            if (rawId.includes('cert') || rawId.includes('1')) {
                matchedFallback = DEFAULT_TRUST_CARDS[0];
            } else if (rawId.includes('exchange') || rawId.includes('buyback') || rawId.includes('2')) {
                matchedFallback = DEFAULT_TRUST_CARDS[1];
            } else if (rawId.includes('return') || rawId.includes('15') || rawId.includes('3')) {
                matchedFallback = DEFAULT_TRUST_CARDS[2];
            } else if (rawId.includes('hallmark') || rawId.includes('purity') || rawId.includes('4')) {
                matchedFallback = DEFAULT_TRUST_CARDS[3];
            }

            const title = item.name || item.label || matchedFallback.title;
            const subtitle = item.subtitle || matchedFallback.subtitle;
            const description = item.description && item.description.length > 25
                ? item.description
                : matchedFallback.description;

            const hasValidImage = typeof item.image === 'string' &&
                item.image.trim().length > 0 &&
                !item.image.includes('placeholder');

            return {
                key: item.itemId || item.id || matchedFallback.key,
                title,
                subtitle,
                description,
                image: hasValidImage ? item.image : matchedFallback.image,
                fallbackImage: matchedFallback.fallbackImage,
                iconName: item.iconName || item.iconKey || matchedFallback.iconName,
                tag: item.tag || matchedFallback.tag
            };
        });
    }, [sectionData?.items]);

    return (
        <section className="overflow-hidden border-b border-[#E8D9E3] bg-gradient-to-b from-[#FCF8FB] to-white py-8 sm:py-16 md:py-20">
            <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Section Header ────────────────────────────────────── */}
                <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-12">
                    {/* Top Diamond Emblem */}
                    <div className="flex items-center justify-center gap-3 mb-2.5">
                        <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#805E7A]/70" />
                        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#805E7A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="6 3 18 3 22 9 12 22 2 9" />
                        </svg>
                        <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#805E7A]/70" />
                    </div>

                    {/* Badge */}
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.26em] text-[#805E7A] block mb-2 font-sans">
                        {badge}
                    </span>

                    {/* Main Title */}
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-espresso font-normal tracking-tight leading-tight mb-2.5">
                        {title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm md:text-[15px] text-[#7F626C] font-light leading-relaxed max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* ── 4 Assurance Cards Grid ────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {cards.map((card) => {
                        const IconComponent = ICON_MAP[card.iconName] || ShieldCheck;

                        return (
                            <div
                                key={card.key}
                                className="group relative flex h-full select-none flex-col justify-between rounded-2xl border border-[#E8D9E3] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-400 hover:-translate-y-1.5 hover:border-[#805E7A]/70 hover:shadow-[0_16px_36px_rgba(15,32,56,0.14)] sm:rounded-3xl sm:p-4 sm:pb-6"
                            >
                                <div className="flex items-center gap-3 sm:block">
                                    {/* 1. Image Container with Zoom-on-Hover */}
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F4EAF1] shadow-inner sm:mb-4.5 sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-2xl">
                                        <img
                                            src={card.image}
                                            alt={`${card.title} - ${card.subtitle}`}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = card.fallbackImage || roundDiamondImg;
                                            }}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108 transform-gpu"
                                        />

                                        {/* Subtle overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                                        {/* Top Glassmorphic Tag */}
                                        <div className="absolute left-2.5 top-2.5 z-10 hidden items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-sans text-[10px] font-medium text-white/95 shadow-2xs backdrop-blur-md sm:flex sm:text-[11px]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                                            <span>{card.tag}</span>
                                        </div>

                                        {/* Floating Dark Blue Icon Badge */}
                                        <div className="absolute bottom-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8D9E3] bg-white/95 text-[#805E7A] shadow-md backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-[#5C3B55] group-hover:text-white sm:bottom-2.5 sm:right-2.5 sm:h-10 sm:w-10 sm:rounded-xl">
                                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" />
                                        </div>
                                    </div>

                                    {/* 2. Text Content */}
                                    <div className="px-1 sm:px-1.5">
                                        <h3 className="font-serif text-base sm:text-[17px] font-bold text-brand-espresso group-hover:text-brand-champagne transition-colors leading-snug tracking-tight mb-1">
                                            {card.title}
                                        </h3>
                                        <h4 className="font-serif italic text-xs sm:text-[13px] text-[#8B6874] mb-2 leading-tight">
                                            {card.subtitle}
                                        </h4>
                                        <p className="hidden text-xs font-light leading-relaxed text-[#7F626C] sm:block">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>

                                {/* 3. Decorative Bottom Gold Accent Line */}
                                <div className="mt-auto hidden px-1 pt-4 sm:block sm:px-1.5">
                                    <div className="w-8 h-[1.5px] bg-brand-champagne/40 rounded-full group-hover:w-16 group-hover:bg-brand-champagne transition-all duration-300" />
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default DiamondTrustSection;
