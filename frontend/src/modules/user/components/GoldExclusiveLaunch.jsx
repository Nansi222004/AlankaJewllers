import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import solitaireImg from '@assets/categories/gold_rings_light.png';
import statementImg from '@assets/categories/sets.png';

const fallbackCards = [
    {
        id: 'gold-exclusive-1',
        title: 'SOULitaire',
        subtitle: 'Solitaire Collection',
        image: solitaireImg,
        path: '/shop?search=solitaire&metal=gold'
    },
    {
        id: 'gold-exclusive-2',
        title: 'Beyond Bold',
        subtitle: 'Statement Collection',
        image: statementImg,
        path: '/shop?search=statement&metal=gold'
    }
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

const GoldExclusiveLaunch = ({ sectionData = null }) => {
    const navigate = useNavigate();

    const cards = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length === 0) return fallbackCards;

        return configured.slice(0, 2).map((item, idx) => ({
            id: item?.itemId || item?.id || `gold-exclusive-${idx + 1}`,
            title: item?.name || item?.label || fallbackCards[idx % fallbackCards.length].title,
            subtitle: item?.subtitle || item?.description || fallbackCards[idx % fallbackCards.length].subtitle,
            image: resolveLegacyCmsAsset(item?.image, fallbackCards[idx % fallbackCards.length].image),
            path: ensureGoldPath(item?.path || fallbackCards[idx % fallbackCards.length].path, item?.categoryId)
        }));
    }, [sectionData]);

    const heading = String(sectionData?.settings?.title || sectionData?.label || 'Exclusive Collection Launch').trim() || 'Exclusive Collection Launch';
    const ctaPath = ensureGoldPath(String(sectionData?.settings?.ctaPath || '/shop?new_arrival=true&metal=gold').trim() || '/shop?new_arrival=true&metal=gold');

    return (
        <section className="w-full py-10 md:py-14 bg-white relative overflow-hidden border-b border-brand-border-soft">
            {/* Background subtle luxury glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-champagne/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="max-w-[1450px] mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Left Side Heading */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:w-[240px] flex flex-col items-center lg:items-start shrink-0 text-center lg:text-left"
                    >
                        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-brand-champagne font-bold mb-2">
                            New Arrivals
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif leading-[1.2] text-brand-espresso mb-6">
                            {heading}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="group flex items-center gap-3 cursor-pointer p-1"
                            onClick={() => navigate(ctaPath)}
                        >
                            <div className="w-12 h-12 flex items-center justify-center border border-brand-border rounded-full group-hover:border-brand-champagne group-hover:bg-brand-plum transition-all duration-300 shadow-2xs">
                                <ArrowRight className="w-5 h-5 text-brand-espresso group-hover:text-brand-champagne-light transition-colors duration-300" />
                            </div>
                            <span className="text-[11px] uppercase tracking-widest font-semibold text-brand-espresso group-hover:text-brand-champagne transition-colors duration-300">
                                View All
                            </span>
                        </motion.button>
                    </motion.div>

                    {/* Right Side Cards */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 w-full">
                        {cards.map((card, idx) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: idx * 0.15 }}
                                onClick={() => navigate(card.path)}
                                className="relative h-[160px] md:h-[220px] rounded-[22px] md:rounded-[28px] overflow-hidden group cursor-pointer shadow-xs hover:shadow-md bg-brand-porcelain border border-brand-border transition-all duration-300"
                            >
                                {/* Image Layer */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    {/* Multi-layered light overlays */}
                                    <div className="absolute inset-0 bg-brand-espresso/25 group-hover:bg-brand-espresso/15 transition-colors duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/80 via-brand-espresso/25 to-transparent" />
                                </div>

                                {/* Center Content */}
                                <div className="relative h-full w-full flex flex-col items-center justify-center z-10 text-center p-6">
                                    <h3 className="text-white text-lg md:text-2xl font-serif tracking-[0.12em] uppercase mb-1.5 [text-shadow:0_2px_8px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-500">
                                        {card.title}
                                    </h3>
                                    
                                    <p className="text-brand-pearl/90 text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-medium mb-3 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)]">
                                        {card.subtitle}
                                    </p>

                                    {/* Understated Action Indicator */}
                                    <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="px-4 py-1 border border-white/50 rounded-full text-brand-champagne-light text-[8px] uppercase tracking-[0.2em] backdrop-blur-xs bg-brand-plum/80 shadow-sm">
                                            Explore Collection
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GoldExclusiveLaunch;
