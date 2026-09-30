import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
    GOLD_TONE_OPTIONS,
    SILVER_TYPE_OPTIONS,
    DIAMOND_TYPE_OPTIONS,
    JEWELLERY_TYPE_CONFIG
} from '@/config/jewelleryFiltersConfig';

export {
    GOLD_TONE_OPTIONS,
    SILVER_TYPE_OPTIONS,
    DIAMOND_TYPE_OPTIONS,
    JEWELLERY_TYPE_CONFIG
};

const useDragScroll = () => {
    const ref = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const onMouseDown = (e) => {
        if (!ref.current) return;
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setStartY(e.pageY - ref.current.offsetTop);
        setScrollLeft(ref.current.scrollLeft);
        setScrollTop(ref.current.scrollTop);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e) => {
        if (!isDragging || !ref.current) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const y = e.pageY - ref.current.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        ref.current.scrollLeft = scrollLeft - walkX;
        ref.current.scrollTop = scrollTop - walkY;
    };

    return {
        ref,
        events: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
        },
        isDragging
    };
};

const HorizontalFilters = ({
    categories = [],
    selectedCategory = 'All',
    onCategoryChange,
    metal = 'All',
    onMetalChange,
    tone = 'All',
    onToneChange,
    silverType = 'All',
    onSilverTypeChange,
    diamondType = 'All',
    onDiamondTypeChange,
    purity = 'All',
    onPurityChange,
    stone = 'All',
    onStonesChange,
    priceRange = 50000,
    onPriceChange,
    audience = 'All',
    onAudienceChange,
    tags = [],
    onTagsChange,
    availability = 'All',
    onAvailabilityChange,
    sortBy = 'New Arrival',
    onSortChange,
    clearAll,
    isCollectionLocked = false,
    hiddenFilterIds = []
}) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [hoveredMetal, setHoveredMetal] = useState(null);
    const filterScroll = useDragScroll();
    const dropdownScroll = useDragScroll();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterScroll.ref.current && !filterScroll.ref.current.contains(event.target)) {
                setActiveDropdown(null);
                setHoveredMetal(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterScroll.ref]);

    // Dynamic Purity options based on active metal context
    const normalizedMetal = String(metal || '').trim().toLowerCase();
    const purityOptions = (() => {
        if (normalizedMetal === 'silver') {
            return [
                { label: 'All', value: 'All' },
                { label: '925 Silver', value: '925' },
                { label: 'Fine Silver', value: 'fine' }
            ];
        }
        if (normalizedMetal === 'gold') {
            return [
                { label: 'All', value: 'All' },
                { label: '24 Ct Gold', value: '24' },
                { label: '22 Ct Gold', value: '22' },
                { label: '18 Ct Gold', value: '18' },
                { label: '14 Ct Gold', value: '14' }
            ];
        }
        if (normalizedMetal === 'diamond') {
            return [
                { label: 'All', value: 'All' },
                { label: '18K Setting', value: '18' },
                { label: '14K Setting', value: '14' },
                { label: 'Platinum 950', value: 'platinum' }
            ];
        }
        return [
            { label: 'All', value: 'All' },
            { label: '925 Silver', value: '925' },
            { label: '24 Ct Gold', value: '24' },
            { label: '22 Ct Gold', value: '22' },
            { label: '18 Ct Gold', value: '18' },
            { label: '14 Ct Gold', value: '14' }
        ];
    })();

    const stoneOptions = [
        { label: 'All', value: 'All' },
        { label: 'Plain / No Stone', value: 'none' },
        { label: 'American Diamond (AD)', value: 'ad' },
        { label: 'Natural Diamond', value: 'natural' },
        { label: 'Lab-Grown Diamond', value: 'lab_grown' },
        { label: 'Pearls & Kundan', value: 'pearl_kundan' }
    ];

    const availabilityOptions = [
        { label: 'All', value: 'All' },
        { label: 'In Stock', value: 'in_stock' },
        { label: 'Out of Stock', value: 'out_of_stock' }
    ];

    const getJewelleryTypeDisplay = () => {
        if (!metal || metal === 'All' || metal === 'all') return '';
        const normMetal = metal.charAt(0).toUpperCase() + metal.slice(1);
        const mLow = normMetal.toLowerCase();
        if (mLow === 'gold' && tone && tone !== 'All' && tone !== 'all') {
            const toneObj = GOLD_TONE_OPTIONS.find(t => t.value.toLowerCase() === tone.toLowerCase() || (t.value === 'gold' && tone.toLowerCase() === 'yellow-gold'));
            return toneObj && toneObj.value !== 'all' ? `Gold (${toneObj.label})` : 'Gold';
        }
        if (mLow === 'silver' && silverType && silverType !== 'All' && silverType !== 'all') {
            const sObj = SILVER_TYPE_OPTIONS.find(s => s.value.toLowerCase() === silverType.toLowerCase() || (s.value === '925' && (silverType.toLowerCase() === 'sterling' || silverType.toLowerCase() === '925-silver')));
            return sObj && sObj.value !== 'all' ? `Silver (${sObj.label})` : 'Silver';
        }
        if (mLow === 'diamond' && diamondType && diamondType !== 'All' && diamondType !== 'all') {
            const dObj = DIAMOND_TYPE_OPTIONS.find(d => d.value.toLowerCase() === diamondType.toLowerCase() || (d.value === 'lab_grown' && (diamondType.toLowerCase() === 'lab-grown' || diamondType.toLowerCase() === 'labgrown')));
            return dObj && dObj.value !== 'all' ? `Diamond (${dObj.label})` : 'Diamond';
        }
        return normMetal;
    };

    const purityDisplayLabel = purityOptions.find(o => o.value === purity)?.label || (purity === 'All' ? 'All' : (['24', '22', '18', '14'].includes(String(purity)) ? `${purity} Ct Gold` : purity));
    const stoneDisplayLabel = stoneOptions.find(o => o.value === stone)?.label || (stone === 'All' ? 'All' : stone);
    const availabilityDisplayLabel = availabilityOptions.find(o => o.value === availability)?.label || (availability === 'All' ? 'All' : availability);

    // EXACT 8 FILTERS IN STRICT ORDER:
    // 1. JEWELLERY TYPE | 2. PRODUCT TYPE | 3. PURITY | 4. STONES | 5. PRICE | 6. SHOP FOR | 7. STYLE | 8. AVAILABILITY
    const filterGroups = [
        {
            id: 'metal',
            label: 'JEWELLERY TYPE',
            value: metal || 'All',
            displayValue: getJewelleryTypeDisplay(),
            options: ['All', 'Gold', 'Silver', 'Diamond', 'Gems'],
            onChange: onMetalChange
        },
        {
            id: 'product-type',
            label: 'PRODUCT TYPE',
            value: selectedCategory || 'All',
            displayValue: selectedCategory !== 'All' ? selectedCategory : '',
            options: ['All', ...categories.map(c => c.name)],
            onChange: onCategoryChange
        },
        {
            id: 'purity',
            label: 'PURITY',
            value: purity || 'All',
            displayValue: purity !== 'All' ? purityDisplayLabel : '',
            options: purityOptions,
            onChange: onPurityChange
        },
        {
            id: 'stones',
            label: 'STONES',
            value: stone || 'All',
            displayValue: stone !== 'All' ? stoneDisplayLabel : '',
            options: stoneOptions,
            onChange: onStonesChange
        },
        {
            id: 'price',
            label: 'PRICE',
            value: priceRange >= 50000 ? 'All' : `Under ₹${priceRange.toLocaleString()}`,
            displayValue: priceRange < 50000 ? `Under ₹${priceRange.toLocaleString()}` : '',
            isSlider: true,
            min: 1000,
            max: 50000,
            step: 500,
            current: priceRange,
            onChange: onPriceChange
        },
        {
            id: 'shop-for',
            label: 'SHOP FOR',
            value: audience === 'All' || !audience ? 'All' : audience.charAt(0).toUpperCase() + audience.slice(1),
            displayValue: (audience && audience !== 'All' && audience !== 'all') ? (audience.charAt(0).toUpperCase() + audience.slice(1)) : '',
            options: ['All', 'Women', 'Men', 'Family'],
            onChange: (val) => onAudienceChange(val.toLowerCase())
        },
        {
            id: 'style',
            label: 'STYLE',
            value: tags.length > 0 ? `${tags.length} Selected` : 'All',
            displayValue: tags.length > 0 ? `${tags.length} Selected` : '',
            options: [
                { label: 'Trending', value: 'isTrending' },
                { label: 'New Arrival', value: 'isNewArrival' },
                { label: 'Best Selling', value: 'isMostGifted' },
                { label: 'Premium', value: 'isPremium' }
            ],
            isMulti: true,
            onChange: onTagsChange
        },
        {
            id: 'availability',
            label: 'AVAILABILITY',
            value: availability || 'All',
            displayValue: availability !== 'All' ? availabilityDisplayLabel : '',
            options: availabilityOptions,
            onChange: onAvailabilityChange
        }
    ];

    const toggleDropdown = (id) => {
        if (activeDropdown === id) {
            setActiveDropdown(null);
            setHoveredMetal(null);
        } else {
            setActiveDropdown(id);
            if (id === 'metal') {
                const mLow = (metal || '').toLowerCase();
                setHoveredMetal(['gold', 'silver', 'diamond'].includes(mLow) ? mLow : null);
            } else {
                setHoveredMetal(null);
            }
        }
    };

    const hasActiveFilters = 
        (selectedCategory && selectedCategory !== 'All') ||
        (metal && metal !== 'All' && !isCollectionLocked) ||
        (tone && tone !== 'All' && tone !== 'all') ||
        (silverType && silverType !== 'All' && silverType !== 'all') ||
        (diamondType && diamondType !== 'All' && diamondType !== 'all') ||
        (purity && purity !== 'All') ||
        (stone && stone !== 'All') ||
        (priceRange && priceRange < 50000) ||
        (audience && audience !== 'All' && audience !== 'all') ||
        (tags && tags.length > 0) ||
        (availability && availability !== 'All');

    return (
        <div className="hidden md:block w-full border-b border-stone-200 bg-white">
            <div className="py-2.5 flex items-center justify-between gap-4">
                <div 
                    {...filterScroll.events}
                    ref={filterScroll.ref}
                    className={`flex items-center gap-2 flex-wrap ${filterScroll.isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                >
                    {filterGroups.filter((group) => !hiddenFilterIds.includes(group.id)).map((group) => {
                        const isGroupActive = Boolean(group.displayValue) || (group.id === 'price' && priceRange < 50000);

                        return (
                            <div key={group.id} className="relative">
                                <button
                                    onClick={() => toggleDropdown(group.id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all text-[12px] uppercase font-bold tracking-wider whitespace-nowrap ${
                                        activeDropdown === group.id || isGroupActive
                                            ? 'border-brand-champagne bg-brand-rosewater text-brand-plum shadow-2xs font-extrabold'
                                            : 'border-stone-200 hover:border-brand-champagne text-stone-700 font-semibold'
                                    }`}
                                >
                                    <span>
                                        {isGroupActive && group.displayValue ? `${group.label}: ${group.displayValue}` : group.label}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-300 ${activeDropdown === group.id ? 'rotate-180 text-brand-champagne' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {activeDropdown === group.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                            transition={{ duration: 0.18 }}
                                            {...dropdownScroll.events}
                                            ref={dropdownScroll.ref}
                                            className={`absolute left-0 mt-2 ${
                                                group.isSlider
                                                    ? 'w-64'
                                                    : group.id === 'metal'
                                                        ? ((hoveredMetal || ['gold', 'silver', 'diamond'].includes(metal.toLowerCase())) ? 'w-auto' : 'w-48')
                                                        : 'w-56'
                                            } bg-white border border-brand-champagne/40 rounded-xl shadow-2xl z-[110] custom-scrollbar overscroll-contain overflow-hidden ${dropdownScroll.isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                                        >
                                            {group.isSlider ? (
                                                <div className="px-5 py-4 w-full">
                                                    <div className="flex justify-between text-xs text-stone-700 font-bold mb-4 tracking-wide">
                                                        <span>₹0</span>
                                                        <span className="text-brand-plum">₹{group.current >= group.max ? `${group.max.toLocaleString()}+` : group.current.toLocaleString()}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={group.min}
                                                        max={group.max}
                                                        step={group.step}
                                                        value={group.current}
                                                        onChange={(e) => group.onChange(Number(e.target.value))}
                                                        className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-champagne"
                                                    />
                                                    <div className="flex justify-between items-center mt-5">
                                                        <button 
                                                            onClick={() => group.onChange(group.max)}
                                                            className="text-[11px] font-bold text-stone-500 hover:text-stone-800 uppercase tracking-widest transition-colors"
                                                        >
                                                            Reset
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="px-4 py-1.5 bg-brand-plum hover:bg-brand-champagne hover:text-brand-espresso text-white border border-brand-plum hover:border-brand-champagne text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors shadow-sm"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : group.id === 'metal' ? (
                                                /* JEWELLERY TYPE Dropdown with Nested Subpanels for Gold, Silver, Diamond */
                                                (() => {
                                                    const mLow = (metal || '').toLowerCase();
                                                    const activeSecondary = hoveredMetal || (['gold', 'silver', 'diamond'].includes(mLow) ? mLow : null);

                                                    return (
                                                        <div className="flex divide-x divide-stone-100 max-h-[350px]">
                                                            {/* Primary Metal Column */}
                                                            <div className="w-44 py-1.5 flex flex-col shrink-0">
                                                                {group.options.map((option) => {
                                                                    const optLow = option.toLowerCase();
                                                                    const isExpandable = ['gold', 'silver', 'diamond'].includes(optLow);
                                                                    const isSelected = mLow === optLow || (option === 'All' && (!metal || metal === 'All'));
                                                                    const isSubpanelActive = activeSecondary === optLow;

                                                                    return (
                                                                        <button
                                                                            key={option}
                                                                            onMouseEnter={() => {
                                                                                if (isExpandable) setHoveredMetal(optLow);
                                                                                else setHoveredMetal(null);
                                                                            }}
                                                                            onClick={() => {
                                                                                if (isExpandable) {
                                                                                    setHoveredMetal(optLow);
                                                                                    group.onChange(optLow);
                                                                                } else {
                                                                                    setHoveredMetal(null);
                                                                                    group.onChange(option === 'All' ? 'All' : optLow);
                                                                                    if (onToneChange) onToneChange(null);
                                                                                    if (onSilverTypeChange) onSilverTypeChange(null);
                                                                                    if (onDiamondTypeChange) onDiamondTypeChange(null);
                                                                                    setActiveDropdown(null);
                                                                                }
                                                                            }}
                                                                            className={`w-full text-left px-3.5 py-2 text-[12.5px] hover:bg-brand-pearl transition-colors flex items-center justify-between group ${
                                                                                isSelected ? 'text-brand-espresso font-bold bg-brand-pearl' : 'text-stone-600'
                                                                            }`}
                                                                        >
                                                                            <span>{option}</span>
                                                                            <div className="flex items-center gap-1">
                                                                                {isSelected && !isExpandable && <Check className="w-3.5 h-3.5 text-brand-champagne" />}
                                                                                {isExpandable && (
                                                                                    <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isSubpanelActive ? 'text-brand-champagne' : 'text-stone-300'}`} />
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            {/* Data-Driven Secondary Column (Gold, Silver, Diamond) */}
                                                            {activeSecondary && JEWELLERY_TYPE_CONFIG[activeSecondary] && (() => {
                                                                const cfg = JEWELLERY_TYPE_CONFIG[activeSecondary];
                                                                const currentVal = activeSecondary === 'gold' ? tone : activeSecondary === 'silver' ? silverType : diamondType;
                                                                const changeHandler = activeSecondary === 'gold' ? onToneChange : activeSecondary === 'silver' ? onSilverTypeChange : onDiamondTypeChange;

                                                                return (
                                                                    <div className="w-52 py-1.5 bg-brand-pearl/60 flex flex-col shrink-0 animate-in fade-in duration-150">
                                                                        <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-taupe border-b border-stone-100 mb-1">
                                                                            {cfg.panelTitle}
                                                                        </div>
                                                                        {cfg.options.map((opt) => {
                                                                            const isOptSelected = (!currentVal || currentVal === 'All' || currentVal === 'all')
                                                                                ? opt.value === 'all'
                                                                                : activeSecondary === 'gold'
                                                                                    ? currentVal.toLowerCase() === opt.value.toLowerCase() || (opt.value === 'gold' && currentVal.toLowerCase() === 'yellow-gold')
                                                                                    : activeSecondary === 'silver'
                                                                                        ? currentVal.toLowerCase() === opt.value.toLowerCase() || (opt.value === '925' && (currentVal.toLowerCase() === 'sterling' || currentVal.toLowerCase() === '925-silver'))
                                                                                        : currentVal.toLowerCase() === opt.value.toLowerCase() || (opt.value === 'lab_grown' && (currentVal.toLowerCase() === 'lab-grown' || currentVal.toLowerCase() === 'labgrown'));

                                                                            return (
                                                                                <button
                                                                                    key={opt.value}
                                                                                    onClick={() => {
                                                                                        group.onChange(activeSecondary);
                                                                                        if (changeHandler) {
                                                                                            changeHandler(opt.value === 'all' ? null : opt.value);
                                                                                        }
                                                                                        setActiveDropdown(null);
                                                                                    }}
                                                                                    className={`w-full text-left px-3.5 py-1.5 text-[12px] hover:bg-white transition-colors flex items-center justify-between group ${
                                                                                        isOptSelected ? 'text-brand-espresso font-bold bg-white shadow-2xs' : 'text-stone-600'
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                                        {opt.image ? (
                                                                                            <div className="w-4 h-4 rounded-full overflow-hidden border border-brand-border shrink-0 shadow-2xs">
                                                                                                <img src={opt.image} alt={opt.label} className="w-full h-full object-cover" />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span
                                                                                                className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border ${activeSecondary === 'diamond' ? 'border-sky-300' : 'border-stone-300'}`}
                                                                                                style={{ backgroundColor: opt.swatchColor }}
                                                                                            />
                                                                                        )}
                                                                                        <span className="truncate">{opt.label}</span>
                                                                                    </div>
                                                                                    {isOptSelected && <Check className="w-3.5 h-3.5 text-brand-champagne shrink-0" />}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div className="py-2 max-h-[350px] overflow-y-auto">
                                                    {group.options.map((option) => {
                                                        const label = typeof option === 'string' ? option : option.label;
                                                        const val = typeof option === 'string' ? option : option.value;
                                                        const isSelected = group.isMulti 
                                                            ? tags.includes(val)
                                                            : (group.value === val || group.value === label || (group.id === 'shop-for' && audience === String(val).toLowerCase()));

                                                        return (
                                                            <button
                                                                key={label}
                                                                onClick={() => {
                                                                    group.onChange(val);
                                                                    if (!group.isMulti) setActiveDropdown(null);
                                                                }}
                                                                className={`w-full text-left px-4 py-2 text-[12.5px] hover:bg-brand-pearl transition-colors flex items-center justify-between group ${
                                                                    isSelected ? 'text-brand-espresso font-bold bg-brand-pearl' : 'text-stone-600'
                                                                }`}
                                                            >
                                                                <span>{label}</span>
                                                                {isSelected && <Check className="w-4 h-4 text-brand-champagne" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                    
                    {/* Clear All Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-brand-plum hover:bg-brand-rosewater rounded-full transition-colors ml-1 shrink-0 uppercase tracking-wider"
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Sort By Separate on Right */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mr-1">Sort:</span>
                    <select 
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="bg-transparent text-[12px] font-bold text-stone-800 outline-none cursor-pointer border-b border-transparent hover:border-brand-champagne transition-all uppercase"
                    >
                        <option value="New Arrival">New Arrival</option>
                        <option value="Price Low to High">Price Low to High</option>
                        <option value="Price High to Low">Price High to Low</option>
                        <option value="Discount">Discount</option>
                        <option value="Best Selling">Best Selling</option>
                    </select>
                </div>
            </div>

            {/* Active Filter Chips Strip (Desktop) */}
            {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap pb-2 pt-0.5 border-t border-stone-100">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mr-1">Active Filters:</span>
                    
                    {/* Jewellery Type Chip */}
                    {metal && metal !== 'All' && !isCollectionLocked && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Jewellery Type: <strong className="capitalize">{metal}</strong></span>
                            <button
                                onClick={() => {
                                    onMetalChange('All');
                                }}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Jewellery Type filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Gold Colour Chip (removable independently) */}
                    {metal?.toLowerCase() === 'gold' && tone && tone !== 'All' && tone !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span 
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                                style={{
                                    backgroundColor: tone === 'rose-gold' ? '#FB7185' : (tone === 'white-gold' ? '#94A3B8' : '#EAB308')
                                }}
                            />
                            <span>Gold Colour: <strong>{GOLD_TONE_OPTIONS.find(t => t.value.toLowerCase() === tone.toLowerCase())?.label || tone}</strong></span>
                            <button
                                onClick={() => onToneChange && onToneChange(null)}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Gold Colour filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Silver Type Chip (removable independently) */}
                    {metal?.toLowerCase() === 'silver' && silverType && silverType !== 'All' && silverType !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span 
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs border border-stone-300"
                                style={{
                                    backgroundColor: SILVER_TYPE_OPTIONS.find(s => s.value.toLowerCase() === silverType.toLowerCase() || (s.value === '925' && (silverType.toLowerCase() === 'sterling' || silverType.toLowerCase() === '925-silver')))?.swatchColor || '#CBD5E1'
                                }}
                            />
                            <span>Silver Type: <strong>{SILVER_TYPE_OPTIONS.find(s => s.value.toLowerCase() === silverType.toLowerCase() || (s.value === '925' && (silverType.toLowerCase() === 'sterling' || silverType.toLowerCase() === '925-silver')))?.label || silverType}</strong></span>
                            <button
                                onClick={() => onSilverTypeChange && onSilverTypeChange(null)}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Silver Type filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Diamond Type Chip (removable independently) */}
                    {metal?.toLowerCase() === 'diamond' && diamondType && diamondType !== 'All' && diamondType !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span 
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs border border-sky-300"
                                style={{
                                    backgroundColor: DIAMOND_TYPE_OPTIONS.find(d => d.value.toLowerCase() === diamondType.toLowerCase() || (d.value === 'lab_grown' && (diamondType.toLowerCase() === 'lab-grown' || diamondType.toLowerCase() === 'labgrown')))?.swatchColor || '#BAE6FD'
                                }}
                            />
                            <span>Diamond Type: <strong>{DIAMOND_TYPE_OPTIONS.find(d => d.value.toLowerCase() === diamondType.toLowerCase() || (d.value === 'lab_grown' && (diamondType.toLowerCase() === 'lab-grown' || diamondType.toLowerCase() === 'labgrown')))?.label || diamondType}</strong></span>
                            <button
                                onClick={() => onDiamondTypeChange && onDiamondTypeChange(null)}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Diamond Type filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Product Type Chip */}
                    {selectedCategory && selectedCategory !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Product Type: <strong>{selectedCategory}</strong></span>
                            <button
                                onClick={() => onCategoryChange('All')}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Product Type filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Purity Chip */}
                    {purity && purity !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Purity: <strong>{purityDisplayLabel}</strong></span>
                            <button
                                onClick={() => onPurityChange('All')}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Purity filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Stones Chip */}
                    {stone && stone !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Stones: <strong>{stoneDisplayLabel}</strong></span>
                            <button
                                onClick={() => onStonesChange('All')}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Stones filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Price Chip */}
                    {priceRange < 50000 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Price: <strong>Under ₹{priceRange.toLocaleString()}</strong></span>
                            <button
                                onClick={() => onPriceChange(50000)}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Reset Price filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Shop For Chip */}
                    {audience && audience !== 'All' && audience !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Shop For: <strong>{audience.charAt(0).toUpperCase() + audience.slice(1)}</strong></span>
                            <button
                                onClick={() => onAudienceChange('all')}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Shop For filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {/* Style Chips */}
                    {tags && tags.map(t => {
                        const tagLabel = {
                            isTrending: 'Trending',
                            isNewArrival: 'New Arrival',
                            isMostGifted: 'Best Selling',
                            isPremium: 'Premium'
                        }[t] || t;
                        return (
                            <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                                <span>Style: <strong>{tagLabel}</strong></span>
                                <button
                                    onClick={() => onTagsChange(t)}
                                    className="hover:text-brand-champagne p-0.5 rounded-full"
                                    title={`Remove ${tagLabel}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}

                    {/* Availability Chip */}
                    {availability && availability !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-pearl border border-brand-champagne/40 text-brand-espresso text-[11px] font-medium shadow-2xs">
                            <span>Availability: <strong>{availabilityDisplayLabel}</strong></span>
                            <button
                                onClick={() => onAvailabilityChange('All')}
                                className="hover:text-brand-champagne p-0.5 rounded-full"
                                title="Remove Availability filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default HorizontalFilters;
