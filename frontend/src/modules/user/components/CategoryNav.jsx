import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../../context/ShopContext';
import AllJewelleryMegaMenu from './AllJewelleryMegaMenu';
import AllJewelleryMenu from './CategoryNavComponents/AllJewelleryMenu';
import BullionsMenu from './CategoryNavComponents/BullionsMenu';
import GiftingMegaMenu from './GiftingMegaMenu';
import { getCollectionTheme } from '../utils/collectionTheme';

const CategoryNav = ({ showMetalToggle = true }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { activeMetal, updateActiveMetal } = useShop();
    const [hoveredItem, setHoveredItem] = useState(null);
    const itemRefs = useRef({});
    const [menuPlacement, setMenuPlacement] = useState({
        availableHeight: 480,
        shiftX: 0,
        maxWidth: 920
    });

    const navItems = [
        { id: 'cat', name: 'Shop by Category', path: '/collections', hasChevron: true },
        { id: 'all', name: 'All Jewellery', path: '/shop', hasChevron: true },
        { id: 'bullions', name: 'Bullions', path: '/shop?metal=gold&karat=24', hasChevron: true },
        { id: 'gifting', name: 'Gifting', path: '/category/women', hasChevron: true },
        { id: 'under50k', name: 'Under ₹50K', path: '/shop?price_max=50000', hasChevron: false },
        { id: 'exclusive', name: 'Exclusive', fullSuffix: ' Collections', path: '/shop?search=exclusive', hasChevron: false },
        { id: 'more', name: 'More', fullSuffix: ' at Alankar Jewellers', path: '/about', hasChevron: false },
    ];

    const resetMenu = () => {
        setHoveredItem(null);
    };

    const updateMenuPlacement = useCallback(() => {
        if (!hoveredItem || !itemRefs.current[hoveredItem]) return;
        const trigger = itemRefs.current[hoveredItem];
        const rect = trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 16;

        // Space from bottom of trigger to bottom of viewport minus safety margin
        const spaceBelow = Math.max(260, Math.floor(viewportHeight - rect.bottom - margin));

        // Desired target width for each menu type
        const targetWidth = hoveredItem === 'cat' ? 920 : (hoveredItem === 'all' ? 820 : (hoveredItem === 'bullions' ? 620 : (hoveredItem === 'gifting' ? 680 : 500)));
        const maxWidth = Math.min(targetWidth, viewportWidth - margin * 2);

        // Calculate horizontal offset so menu never extends beyond right or left viewport edges
        let shiftX = 0;
        if (rect.left + maxWidth > viewportWidth - margin) {
            shiftX = (viewportWidth - margin) - (rect.left + maxWidth);
        }
        if (rect.left + shiftX < margin) {
            shiftX = margin - rect.left;
        }

        setMenuPlacement({
            availableHeight: spaceBelow,
            shiftX,
            maxWidth
        });
    }, [hoveredItem]);

    const isItemActive = (item) => {
        if (item.id === 'under50k') {
            const params = new URLSearchParams(location.search);
            const pMax = params.get('price_max') || params.get('maxPrice') || params.get('priceMax');
            const pMin = params.get('price_min') || params.get('minPrice') || params.get('priceMin');
            return location.pathname === '/shop' && Number(pMax) === 50000 && (!pMin || Number(pMin) <= 0);
        }
        if (item.id === 'gifting') {
            return (
                location.pathname.startsWith('/category/men') ||
                location.pathname.startsWith('/category/women') ||
                location.pathname.startsWith('/category/family') ||
                location.pathname.startsWith('/gift-for-him') ||
                location.pathname.startsWith('/gift-for-her') ||
                location.pathname.startsWith('/gift-for-family') ||
                location.pathname.startsWith('/gift')
            );
        }
        return false;
    };

    useEffect(() => {
        updateMenuPlacement();
        window.addEventListener('resize', updateMenuPlacement);
        window.addEventListener('scroll', updateMenuPlacement, { passive: true });
        return () => {
            window.removeEventListener('resize', updateMenuPlacement);
            window.removeEventListener('scroll', updateMenuPlacement);
        };
    }, [updateMenuPlacement]);

    // Keep the metal toggle consistent with explicit route/query.
    // Gold is the default home selection; explicit URL takes precedence over default.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const metalParam = String(params.get('metal') || '').trim().toLowerCase();
        const karatParam = String(params.get('karat') || params.get('purity') || '').trim();
        const isSilverRoute = location.pathname.startsWith('/silver') || metalParam === 'silver';
        const isGemsRoute = location.pathname.startsWith('/gems') || metalParam === 'gems' || metalParam === 'gemstone' || metalParam === 'gemstones';
        const isDiamondRoute = location.pathname.startsWith('/diamond') || metalParam === 'diamond';
        const isGoldRoute = location.pathname === '/' || location.pathname.startsWith('/gold') || metalParam === 'gold' || (!metalParam && Boolean(karatParam));

        let explicitMetal = null;
        if (isGemsRoute) explicitMetal = 'gems';
        else if (isDiamondRoute) explicitMetal = 'diamond';
        else if (isGoldRoute) explicitMetal = 'gold';
        else if (isSilverRoute) explicitMetal = 'silver';

        if (explicitMetal && explicitMetal !== activeMetal) {
            updateActiveMetal(explicitMetal);
        }
    }, [activeMetal, location.pathname, location.search, updateActiveMetal]);

    const currentTheme = getCollectionTheme(activeMetal);

    return (
        <div className="border-b block w-full bg-white relative z-40" style={{ borderColor: '#EBEBEB', fontFamily: "'Inter', 'Lato', sans-serif" }}>
            <style>{`
                .category-nav-scroll::-webkit-scrollbar { display: none; }
                .category-nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative" onMouseLeave={resetMenu}>
                {/* Navigation Links - Responsive without left-clipping on any screen */}
                <div className="category-nav-scroll flex w-full items-center overflow-x-auto overscroll-x-contain py-1 scroll-smooth lg:overflow-visible">
                    <ul
                        className="flex w-max min-w-full flex-nowrap items-center justify-start gap-5 px-3 py-1 sm:gap-6 sm:px-4 lg:justify-center lg:gap-5 xl:gap-7 2xl:gap-10"
                    >
                        {navItems.map((item) => {
                            const active = isItemActive(item);
                            return (
                                <li
                                    key={item.id}
                                    ref={(el) => { itemRefs.current[item.id] = el; }}
                                    onMouseEnter={() => {
                                        // 'Shop by Category', 'All Jewellery', 'Bullions', and 'Gifting' show dropdowns on hover
                                        if (item.id === 'cat' || item.id === 'all' || item.id === 'bullions' || item.id === 'gifting') {
                                            setHoveredItem(item.id);
                                        } else {
                                            setHoveredItem(null);
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="relative shrink-0 py-1.5"
                                >
                                    <Link
                                        to={item.path}
                                        onClick={(e) => {
                                            if (item.id === 'gifting') {
                                                e.preventDefault();
                                                setHoveredItem(hoveredItem === item.id ? null : item.id);
                                                return;
                                            }
                                            if (item.hasChevron && window.innerWidth < 1024) {
                                                e.preventDefault();
                                                setHoveredItem(hoveredItem === item.id ? null : item.id);
                                            }
                                        }}
                                        className={`flex min-h-8 items-center gap-1 whitespace-nowrap font-sans text-[11px] font-bold uppercase tracking-normal transition-all duration-200 sm:text-[11.5px] lg:text-[12px] xl:text-[12.5px] xl:tracking-[0.04em] 2xl:text-[13px] ${
                                            active || hoveredItem === item.id ? 'text-brand-champagne' : 'text-brand-espresso hover:text-brand-champagne'
                                        }`}
                                    >
                                        <span>{item.name}</span>
                                        {item.fullSuffix && <span className="hidden 2xl:inline">{item.fullSuffix}</span>}
                                        {item.hasChevron && (
                                            <ChevronDown
                                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform duration-300 ${
                                                    hoveredItem === item.id ? 'rotate-180 text-brand-champagne' : (active ? 'text-brand-champagne' : 'text-brand-taupe')
                                                }`}
                                            />
                                        )}
                                    </Link>

                                    {/* Dropdowns Mapping */}
                                    <AnimatePresence>
                                        {hoveredItem === item.id && (
                                            <div 
                                                className="absolute top-full pt-2 z-[110]"
                                                style={{
                                                    left: `${menuPlacement.shiftX || 0}px`
                                                }}
                                                data-lenis-prevent
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="bg-white shadow-[0_20px_45px_rgba(51,40,39,0.12)] border border-brand-border overflow-hidden rounded-b-2xl max-w-[calc(100vw-2rem)]"
                                                    style={{
                                                        maxHeight: `${menuPlacement.availableHeight}px`
                                                    }}
                                                    data-lenis-prevent
                                                >
                                                    {item.id === 'cat' && (
                                                        <AllJewelleryMenu 
                                                            resetMenu={resetMenu} 
                                                            availableHeight={menuPlacement.availableHeight}
                                                            maxWidth={menuPlacement.maxWidth}
                                                        />
                                                    )}
                                                    {item.id === 'all' && (
                                                        <AllJewelleryMegaMenu 
                                                            resetMenu={resetMenu} 
                                                            availableHeight={menuPlacement.availableHeight}
                                                            maxWidth={menuPlacement.maxWidth}
                                                        />
                                                    )}
                                                    {item.id === 'bullions' && (
                                                        <BullionsMenu 
                                                            resetMenu={resetMenu} 
                                                            availableHeight={menuPlacement.availableHeight}
                                                            maxWidth={menuPlacement.maxWidth}
                                                        />
                                                    )}
                                                    {item.id === 'gifting' && (
                                                        <GiftingMegaMenu 
                                                            resetMenu={resetMenu} 
                                                            availableHeight={menuPlacement.availableHeight}
                                                            maxWidth={menuPlacement.maxWidth}
                                                        />
                                                    )}
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Gold / Silver / Diamond / Gems 4-Option Selector — Balanced, Aligned & Responsive */}
                {showMetalToggle && (
                    <div className="relative flex justify-center px-2 pb-1.5 pt-0.5 sm:px-4">
                        <div
                            className="p-0.5 md:p-1 w-full sm:w-[680px] max-w-full rounded-full border flex items-center bg-white relative transition-all duration-300"
                            style={{
                                borderColor: currentTheme.containerBorder,
                                boxShadow: currentTheme.containerGlow,
                            }}
                        >
                            {/* Animated Background Pill */}
                            <div className="absolute inset-0.5 md:inset-1 flex" style={{ zIndex: 0 }}>
                                <motion.div
                                    layout
                                    initial={false}
                                    animate={{
                                        x: activeMetal === 'gold' ? '0%' : (activeMetal === 'silver' ? '100%' : (activeMetal === 'diamond' ? '200%' : '300%')),
                                        background: currentTheme.pillBackground,
                                        boxShadow: currentTheme.pillShadow,
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                    className="w-1/4 h-full rounded-full"
                                />
                            </div>

                            {/* Option 1: Gold */}
                            <button
                                onClick={() => {
                                    updateActiveMetal('gold');
                                    navigate('/');
                                }}
                                className={`relative flex-1 py-1.5 md:py-2 px-1 sm:px-3 md:px-5 rounded-full text-[10px] sm:text-[11px] md:text-[12.5px] font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 z-10 text-center ${activeMetal === 'gold' ? 'text-brand-espresso font-extrabold' : 'text-brand-taupe hover:text-brand-espresso'}`}
                            >
                                Gold
                            </button>

                            {/* Option 2: Silver */}
                            <button
                                onClick={() => {
                                    updateActiveMetal('silver');
                                    navigate('/silver-collection');
                                }}
                                className={`relative flex-1 py-1.5 md:py-2 px-1 sm:px-3 md:px-5 rounded-full text-[10px] sm:text-[11px] md:text-[12.5px] font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 z-10 text-center ${activeMetal === 'silver' ? 'text-white font-bold' : 'text-brand-taupe hover:text-brand-espresso'}`}
                            >
                                Silver
                            </button>

                            {/* Option 3: Diamond */}
                            <button
                                onClick={() => {
                                    updateActiveMetal('diamond');
                                    navigate('/diamond-collection');
                                }}
                                className={`relative flex-1 py-1.5 md:py-2 px-1 sm:px-3 md:px-5 rounded-full text-[10px] sm:text-[11px] md:text-[12.5px] font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 z-10 text-center ${activeMetal === 'diamond' ? 'text-white font-bold' : 'text-brand-taupe hover:text-brand-espresso'}`}
                            >
                                Diamond
                            </button>

                            {/* Option 4: Gems */}
                            <button
                                onClick={() => {
                                    updateActiveMetal('gems');
                                    navigate('/gems-collection');
                                }}
                                className={`relative flex-1 py-1.5 md:py-2 px-1 sm:px-3 md:px-5 rounded-full text-[10px] sm:text-[11px] md:text-[12.5px] font-bold uppercase tracking-wider md:tracking-widest transition-colors duration-300 z-10 text-center ${activeMetal === 'gems' ? 'text-white font-bold' : 'text-brand-taupe hover:text-brand-espresso'}`}
                            >
                                Gems
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryNav;
