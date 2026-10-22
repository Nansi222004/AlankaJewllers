import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHomepageCms } from '../hooks/useHomepageCms';

// Import images (Silver)
import newEarrings from '@assets/new_launch_earrings.png';
import newChains from '@assets/new_launch_chains.png';
import newStuds from '@assets/new_launch_studs.png';
import newBracelets from '@assets/new_launch_bracelets.png';
import newAnklets from '@assets/new_launch_anklets.png';

// Import images (Gold)
import goldLaunchEarrings from '@assets/gold_launch_earrings.jpg';
import goldLaunchChains from '@assets/gold_launch_chains.jpg';
import goldLaunchRings from '@assets/gold_launch_rings.jpg';
import goldLaunchBangles from '@assets/gold_launch_bangles.png';
import goldLaunchMangalsutra from '@assets/gold_launch_mangalsutra.png';

import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';
import { ensureSilverHomePath } from '../utils/silverHomePaths';

const newLaunches = [
    { id: 'earrings', name: "Earrings", image: newEarrings, path: "/shop?metal=silver&category=earrings" },
    { id: 'chains', name: "Chains", image: newChains, path: "/shop?metal=silver&category=chains" },
    { id: 'studs', name: "Studs", image: newStuds, path: "/shop?metal=silver&category=studs" },
    { id: 'bracelets', name: "Bracelets", image: newBracelets, path: "/shop?metal=silver&category=bracelets" },
    { id: 'anklets', name: "Anklets", image: newAnklets, path: "/shop?metal=silver&category=anklets" }
];

const goldLaunches = [
    { id: 'gold-earrings', name: "Earrings", image: goldLaunchEarrings, path: "/shop?metal=gold&category=earrings" },
    { id: 'gold-chains', name: "Chains", image: goldLaunchChains, path: "/shop?metal=gold&category=chains" },
    { id: 'gold-rings', name: "Rings", image: goldLaunchRings, path: "/shop?metal=gold&category=rings" },
    { id: 'gold-bangles', name: "Bangles", image: goldLaunchBangles, path: "/shop?metal=gold&category=bangles" },
    { id: 'gold-mangalsutra', name: "Mangalsutra", image: goldLaunchMangalsutra, path: "/shop?metal=gold&category=mangalsutra" }
];

const ensureGoldLaunchPath = (rawPath = '/shop?metal=gold', categoryId = '') => {
    if (categoryId) return `/shop?metal=gold&category=${encodeURIComponent(categoryId)}`;
    const source = String(rawPath || '').trim();
    if (!source) return '/shop?metal=gold';
    if (!source.startsWith('/shop')) return source;
    if (/([?&])metal=gold(&|$)/i.test(source)) return source;
    return `${source}${source.includes('?') ? '&' : '?'}metal=gold`;
};

const resolveLaunchPath = (item, fallbackPath = '/shop', metal = 'silver') => {
    const isGold = metal === 'gold';
    const pathFn = isGold ? ensureGoldLaunchPath : ensureSilverHomePath;
    const categoryId = item?.categoryId;
    if (categoryId) {
        return pathFn(`/shop?category=${categoryId}`, categoryId);
    }
    if (item?.path) return pathFn(item.path);
    return pathFn(fallbackPath);
};

const NewLaunchSection = ({ metal = 'silver', sectionData: propSectionData = null }) => {
    const isGold = metal === 'gold';
    const { data: homepageSections = {}, isSuccess } = useHomepageCms();

    const sectionData = propSectionData || (!isGold ? homepageSections?.['new-launch'] : null);

    // Section visibility: respect isActive toggle from Admin CMS
    if (sectionData && sectionData.isActive === false) {
        return null;
    }
    // If silver home and CMS data loaded successfully and new-launch is absent from active sections, it is disabled
    if (!isGold && !propSectionData && isSuccess && Object.keys(homepageSections).length > 0 && !sectionData) {
        return null;
    }

    const defaultList = isGold ? goldLaunches : newLaunches;
    const configuredItems = Array.isArray(sectionData?.items) ? sectionData.items : [];
    const normalizedConfiguredItems = configuredItems.map((item, index) => {
        const fallbackItem = defaultList[index % defaultList.length];
        return {
            ...item,
            id: item.itemId || item._id || item.id || `launch-${index}`,
            name: item.name || item.label || fallbackItem?.name || 'Limited Edition',
            image: resolveLegacyCmsAsset(item.image, fallbackItem?.image || (isGold ? goldLaunchEarrings : newEarrings)),
            path: resolveLaunchPath(item, fallbackItem?.path || (isGold ? '/shop?metal=gold' : '/shop'), metal),
            categoryId: item.categoryId || null,
            ctaLabel: item.ctaLabel || item.buttonText || 'EXPLORE'
        };
    });
    const baseItems = normalizedConfiguredItems.length > 0 ? normalizedConfiguredItems : defaultList;

    // We want exactly 20 items for a smooth curved 3D arc with large radius
    const cylinderItems = useMemo(() => {
        const items = [];
        while (items.length < 20) {
            items.push(...baseItems);
        }
        return items.slice(0, 20);
    }, [baseItems]);

    // Responsive measurements for the wide shallow curve
    const [radius, setRadius] = useState(1200);
    const [cardWidth, setCardWidth] = useState(300);
    const [cardHeight, setCardHeight] = useState(420);

    useEffect(() => {
        const updateDims = () => {
            if (window.innerWidth < 480) {
                setRadius(450);
                setCardWidth(130);
                setCardHeight(185);
            } else if (window.innerWidth < 768) {
                setRadius(600);
                setCardWidth(160);
                setCardHeight(225);
            } else if (window.innerWidth < 1024) {
                setRadius(800);
                setCardWidth(190);
                setCardHeight(270);
            } else {
                setRadius(1000);
                setCardWidth(235);
                setCardHeight(330);
            }
        };
        updateDims();
        window.addEventListener('resize', updateDims);
        return () => window.removeEventListener('resize', updateDims);
    }, []);

    return (
        <section 
            id={isGold ? "gold-limited-edition" : "new-launch"}
            className="pt-6 pb-2 md:pt-8 md:pb-3 bg-brand-plum border-y border-brand-champagne/20 relative overflow-hidden"
            style={{
                '--radius': `${radius}px`,
                '--cardW': `${cardWidth}px`,
                '--cardH': `${cardHeight}px`
            }}
        >
            {/* Inline styles for the SHALLOW 3D Curve Animation */}
            <style>
                {`
                @keyframes spinShallowCylinder {
                    0% { transform: translateZ(calc(var(--radius) * -1)) rotateY(0deg); }
                    100% { transform: translateZ(calc(var(--radius) * -1)) rotateY(-360deg); }
                }
                .scene {
                    perspective: 4000px;
                    width: 100%;
                    height: var(--cardH);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 1rem;
                }
                .rotator {
                    width: var(--cardW);
                    height: var(--cardH);
                    position: relative;
                    transform-style: preserve-3d;
                    animation: spinShallowCylinder 80s infinite linear;
                }
                .rotator:hover {
                    animation-play-state: paused;
                }
                .cylinder-card {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 1.25rem;
                }
                `}
            </style>

            <div className="container mx-auto px-4 md:px-6 relative z-10 overflow-visible">

                {/* Header Area */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col items-center justify-center text-center"
                >
                    <div className="inline-block bg-brand-champagne/10 border border-brand-champagne/30 text-brand-champagne-light px-4 py-0.5 font-serif tracking-[0.2em] text-[9px] uppercase rounded-full shadow-sm mb-2 md:mb-3">
                        {sectionData?.settings?.badge || sectionData?.settings?.subtitle || sectionData?.subtitle || "New Launch"}
                    </div>
                    <h3 className="font-serif text-brand-pearl text-2xl md:text-4xl font-light tracking-tight uppercase drop-shadow-sm">
                        {sectionData?.settings?.title || sectionData?.label || "Limited Edition"}
                    </h3>
                </motion.div>

                {/* 3D Curved Carousel Area */}
                <div className="scene">
                    <div className="rotator">
                        {cylinderItems.map((item, index) => {
                            const itemLabel = item.name || item.label;
                            const itemPath = item.path || (isGold ? '/shop?metal=gold' : '/shop');
                            // Calculate proper angle for 20 items (360 / 20 = 18)
                            const angle = index * 18;

                            return (
                                <div
                                    key={`cyl-${index}`}
                                    className="cylinder-card shadow-xl hover:shadow-2xl group transition-shadow duration-500"
                                    style={{
                                        transform: `rotateY(${angle}deg) translateZ(var(--radius))`,
                                    }}
                                >
                                    <Link to={itemPath} className="block w-full h-full relative isolate rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer bg-brand-plum border border-brand-champagne/20">
                                        {/* Image */}
                                        <div className="absolute inset-0 bg-brand-plum">
                                            <img
                                                src={item.image}
                                                alt={itemLabel}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Classic Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-75"></div>

                                        {/* Text Section overlay at bottom */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5 flex flex-col items-center justify-end text-center z-10">
                                            <h4 className="font-serif font-medium text-base md:text-xl text-brand-pearl tracking-[0.15em] mb-1.5 md:mb-2 drop-shadow-lg uppercase">
                                                {itemLabel}
                                            </h4>
                                            
                                            {/* Discover/Animated Arrow */}
                                            <div className="flex items-center gap-2 text-brand-champagne-light transition-all duration-500">
                                                <div className="h-[1px] w-4 bg-brand-champagne/40 group-hover:w-6 transition-all"></div>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.35em] drop-shadow-md">
                                                    {item.ctaLabel || item.buttonText || 'EXPLORE'}
                                                </span>
                                                <div className="h-[1px] w-4 bg-brand-champagne/40 group-hover:w-6 transition-all"></div>
                                            </div>
                                        </div>

                                        {/* Border Glow on Hover */}
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-champagne/50 rounded-2xl md:rounded-3xl transition-colors duration-500 pointer-events-none"></div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default NewLaunchSection;
