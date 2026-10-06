import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Gem, RotateCcw, Truck, FileText, Shield, Gift, Lock, CreditCard } from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';
import { useHomepageCms } from '../hooks/useHomepageCms';

const iconMap = {
    gem: Gem,
    'rotate-ccw': RotateCcw,
    truck: Truck,
    'file-text': FileText,
    shield: Shield,
    gift: Gift,
    sparkles: AlankarJewelleryMark,
    lock: Lock,
    'credit-card': CreditCard
};

const FALLBACK_PROMISES = [
    {
        id: 1,
        iconKey: 'gem',
        title: 'Pure 925',
        subtitle: 'SILVER',
        desc: 'Certified Authenticity'
    },
    {
        id: 2,
        iconKey: 'rotate-ccw',
        title: '30-Day Easy',
        subtitle: 'RETURN',
        desc: 'Hassle-free Refund'
    },
    {
        id: 3,
        iconKey: 'truck',
        title: 'Free Delivery',
        subtitle: 'ABOVE ₹999',
        desc: 'Fast Shipping'
    },
    {
        id: 4,
        iconKey: 'file-text',
        title: 'T&C Apply',
        subtitle: 'SECURE SHOP',
        desc: '100% Protection'
    }
];

const BrandPromises = () => {
    const { data: homepageSections = {} } = useHomepageCms();
    const sectionData = homepageSections?.['brand-promises'];

    const promises = Array.isArray(sectionData?.items) && sectionData.items.length > 0
        ? sectionData.items.map((item, index) => ({
            id: item.itemId || item.id || item._id || `promise-${index + 1}`,
            iconKey: item.iconKey || FALLBACK_PROMISES[index]?.iconKey || 'gem',
            title: item.name || item.label || FALLBACK_PROMISES[index]?.title || 'Promise',
            subtitle: item.subtitle || FALLBACK_PROMISES[index]?.subtitle || '',
            desc: item.description || FALLBACK_PROMISES[index]?.desc || ''
        }))
        : FALLBACK_PROMISES;

    return (
        <section className="py-7 md:py-20 bg-[#EEE3E6] relative overflow-hidden border-t border-[#D2BBC3]">
            <div className="container mx-auto px-4 md:px-8 max-w-[1400px]">
                {/* Header */}
                <div className="text-center mb-5 md:mb-16">
                    <div className="inline-flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 text-brand-champagne text-[9px] md:text-[10px] uppercase font-bold tracking-[0.25em] md:tracking-[0.3em]">
                        <AlankarJewelleryMark className="w-3 h-3 md:w-3.5 md:h-3.5 text-brand-champagne" />
                        <span>The AlankarJewellers Touch</span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl md:text-4xl text-brand-espresso font-normal tracking-tight">
                        {sectionData?.label || 'Why Choose Us'}
                    </h2>
                    <div className="w-10 md:w-12 h-[1px] bg-brand-champagne mx-auto mt-2 md:mt-4" />
                </div>

                {/* ── MOBILE COMPACT 2-COLUMN TRUST GRID (< md) ── */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:hidden">
                    {promises.map((item, index) => {
                        const Icon = iconMap[item.iconKey] || Gem;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="flex flex-col items-center justify-center text-center p-3 sm:p-3.5 bg-white/90 rounded-2xl border border-brand-border/80 shadow-xs hover:border-brand-champagne/40 transition-colors"
                                style={{ minHeight: '115px' }}
                            >
                                {/* Compact Icon Circle */}
                                <div className="w-10 h-10 rounded-full bg-brand-pearl border border-brand-champagne/40 flex items-center justify-center text-brand-champagne mb-2 shadow-2xs">
                                    <Icon strokeWidth={1.5} className="w-5 h-5 text-brand-champagne" />
                                </div>

                                {/* Typography */}
                                <div className="space-y-0.5 max-w-full px-1">
                                    {item.subtitle && (
                                        <span className="text-[8.5px] font-sans font-bold uppercase tracking-[0.2em] text-brand-champagne block truncate">
                                            {item.subtitle}
                                        </span>
                                    )}
                                    <h3 className="font-serif text-[12.5px] sm:text-[13px] font-semibold text-brand-espresso leading-snug tracking-tight">
                                        {item.title}
                                    </h3>
                                    {item.desc && (
                                        <p className="text-stone-500 font-sans text-[10px] leading-tight truncate opacity-85 font-light">
                                            {item.desc}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* ── DESKTOP EDITORIAL COLUMN PILLARS WITH VERTICAL DIVIDERS (md+) ── */}
                <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-brand-border border-y border-brand-border py-6 md:py-10 bg-white/60 rounded-3xl shadow-xs">
                    {promises.map((item, index) => {
                        const Icon = iconMap[item.iconKey] || Gem;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="flex flex-col items-center text-center p-6 md:p-8 group cursor-default"
                            >
                                {/* Delicate Gold Ring Icon Emblem */}
                                <div className="w-14 h-14 rounded-full bg-white border border-brand-champagne/40 shadow-xs flex items-center justify-center text-brand-champagne mb-5 group-hover:scale-110 group-hover:border-brand-champagne group-hover:bg-brand-plum group-hover:text-brand-champagne-light transition-all duration-500">
                                    <Icon strokeWidth={1.5} className="w-6 h-6 transition-transform duration-500" />
                                </div>

                                {/* Typography */}
                                <div className="space-y-1.5">
                                    {item.subtitle && (
                                        <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-brand-champagne block">
                                            {item.subtitle}
                                        </span>
                                    )}
                                    <h3 className="font-serif text-base md:text-lg font-medium text-brand-espresso tracking-tight">
                                        {item.title}
                                    </h3>
                                    {item.desc && (
                                        <p className="text-stone-500 font-sans text-xs leading-relaxed max-w-[200px] mx-auto pt-1 font-light">
                                            {item.desc}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default BrandPromises;
