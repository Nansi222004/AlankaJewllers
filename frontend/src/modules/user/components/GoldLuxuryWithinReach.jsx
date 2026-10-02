import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import range10k from '@assets/gold_lifestyle/gold_minimalistic.png';
import range20k from '@assets/categories/gold_earrings_light.png';
import range30k from '@assets/categories/gold_pendants_light.png';
import range50k from '@assets/gold_lifestyle/gold_statement_50k.jpg';

const GOLD_PRICE_TIERS = [
    {
        key: '10k',
        priceMax: 10000,
        title: 'UNDER INR 10,000',
        badge: '₹10,000',
        descriptor: 'Everyday Gold',
        image: range10k,
        path: '/shop?price_max=10000&metal=gold'
    },
    {
        key: '20k',
        priceMax: 20000,
        title: 'UNDER INR 20,000',
        badge: '₹20,000',
        descriptor: 'Elegant Essentials',
        image: range20k,
        path: '/shop?price_max=20000&metal=gold'
    },
    {
        key: '30k',
        priceMax: 30000,
        title: 'UNDER INR 30,000',
        badge: '₹30,000',
        descriptor: 'Statement Styles',
        image: range30k,
        path: '/shop?price_max=30000&metal=gold'
    },
    {
        key: '50k',
        priceMax: 50000,
        title: 'UNDER INR 50,000',
        badge: '₹50,000',
        descriptor: 'Premium Gold',
        image: range50k,
        path: '/shop?price_max=50000&metal=gold'
    }
];

const parsePriceMax = (item = {}) => {
    const direct = Number(item?.priceMax || item?.price || 0);
    if (Number.isFinite(direct) && direct > 0) return direct;
    const rawStr = String(item?.name || item?.label || item?.title || '');
    const fromTitle = rawStr.replace(/[^0-9]/g, '');
    if (!fromTitle) return null;
    const parsed = Number(fromTitle);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const ensureGoldPricePath = (priceMax, categoryId = '') => {
    const params = new URLSearchParams();
    params.set('price_max', String(priceMax));
    params.set('metal', 'gold');
    const normalizedCategory = String(categoryId || '').trim();
    if (normalizedCategory) {
        params.set('category', normalizedCategory);
    }
    return `/shop?${params.toString()}`;
};

const GoldLuxuryWithinReach = ({ sectionData = null }) => {
    const items = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];

        // Exclude unwanted tiers: Under INR 15,000, Under INR 40,000, and Premium Gifts
        const validConfigured = configured.filter((item) => {
            const pMax = parsePriceMax(item);
            const rawName = String(item?.name || item?.label || item?.title || '').toLowerCase();
            if (rawName.includes('gift') || rawName.includes('15000') || rawName.includes('40000')) {
                return false;
            }
            if (pMax === 15000 || pMax === 40000) {
                return false;
            }
            return true;
        });

        return GOLD_PRICE_TIERS.map((tier) => {
            const match = validConfigured.find((c) => parsePriceMax(c) === tier.priceMax);
            if (!match) return tier;

            const categoryId = String(match?.categoryId || '').trim();
            const resolvedImage = match?.image ? resolveLegacyCmsAsset(match.image, tier.image) : tier.image;
            const customDescriptor = String(match?.subtitle || match?.description || '').trim();

            return {
                ...tier,
                id: match?.itemId || match?.id || tier.key,
                descriptor: customDescriptor || tier.descriptor,
                image: resolvedImage || tier.image,
                path: ensureGoldPricePath(tier.priceMax, categoryId)
            };
        });
    }, [sectionData]);

    const sectionTitle = String(sectionData?.settings?.title || sectionData?.label || 'Luxury within Reach').trim() || 'Luxury within Reach';
    const sectionSubtitle = String(
        sectionData?.settings?.subtitle || 
        sectionData?.settings?.description || 
        'Fine gold jewellery thoughtfully curated across approachable price points.'
    ).trim();

    return (
        <section 
            id="gold-luxury-within-reach"
            aria-label="Shop Gold Jewellery by Budget" 
            className="w-full py-8 sm:py-10 md:py-12 bg-[#FBF8F7] border-y border-[#E9DEDA] overflow-hidden"
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#B8956A] mb-1.5 block">
                        Accessible Luxury
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#332827] font-normal leading-tight tracking-tight">
                        {sectionTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#766866] mt-1.5 sm:mt-2 max-w-md sm:max-w-lg mx-auto leading-relaxed">
                        {sectionSubtitle}
                    </p>
                    <div className="h-px w-12 bg-[#B8956A]/40 mt-2.5 sm:mt-3 mx-auto" />
                </div>

                {/* Compact 4-Card Grid: Desktop 4 in a row, Mobile 2x2 grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.key || item.id || idx}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            className="h-full"
                        >
                            <Link
                                to={item.path}
                                id={`gold-budget-card-${item.key || idx}`}
                                className="group flex flex-col h-full bg-white rounded-xl sm:rounded-2xl border border-[#E9DEDA] hover:border-[#B8956A]/60 shadow-[0_2px_12px_-4px_rgba(51,40,39,0.05)] hover:shadow-[0_10px_25px_-8px_rgba(184,149,106,0.18)] transition-all duration-300 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-[#B8956A]/50"
                            >
                                {/* Image Container: 4:3 ratio, light editorial presentation */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7EFEE]">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    {/* Budget Badge */}
                                    <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/95 backdrop-blur-xs border border-[#E9DEDA] text-[#332827] text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-2xs tracking-wide">
                                        {item.badge}
                                    </span>
                                </div>

                                {/* Card Details */}
                                <div className="p-3 sm:p-4 md:p-5 flex flex-col justify-between flex-1 bg-white border-t border-[#E9DEDA]/60">
                                    <div>
                                        <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-[0.16em] uppercase text-[#766866] block mb-1">
                                            {item.descriptor}
                                        </span>
                                        <h3 className="text-xs sm:text-sm md:text-[15px] font-serif font-semibold text-[#332827] group-hover:text-[#B8956A] transition-colors uppercase tracking-wider leading-snug">
                                            {item.title}
                                        </h3>
                                    </div>

                                    {/* CTA link */}
                                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-2.5 border-t border-[#F7EFEE] flex items-center justify-between">
                                        <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#B8956A] group-hover:text-[#332827] transition-colors inline-flex items-center gap-1 sm:gap-1.5">
                                            EXPLORE COLLECTION <ArrowRight size={11} className="transition-transform group-hover:translate-x-1 shrink-0" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default GoldLuxuryWithinReach;
