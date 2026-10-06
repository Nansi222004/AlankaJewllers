import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Gem, RotateCcw, Eye } from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';
import { formatCurrency, getProductPrice, getProductMRP } from '../utils/price';
import { getProductCardUrl } from '../../../utils/imageUtils';

import roundDiamondImg from '@assets/diamonds/round.png';
import ringFallbackImg from '@assets/heer_custom_ring.png';
import necklaceFallbackImg from '@assets/cat_wedding_diamond.png';
import braceletFallbackImg from '@assets/about_craft_2.png';
import earringFallbackImg from '@assets/edits/edit_everyday.png';

const CATEGORY_TABS = [
    { id: 'all', label: 'All Diamond Creations' },
    { id: 'ring', label: 'Rings' },
    { id: 'solitaire', label: 'Solitaires' },
    { id: 'earring', label: 'Earrings' },
    { id: 'necklace', label: 'Pendants & Necklaces' },
    { id: 'bangle', label: 'Bangles & Bracelets' },
];

const PRICE_TIERS = [
    { id: 'all', label: 'All Prices', min: 0, max: Infinity },
    { id: 'under-35k', label: 'Under ₹35,000', min: 0, max: 35000 },
    { id: '35k-75k', label: '₹35,000 - ₹75,000', min: 35000, max: 75000 },
    { id: '75k-150k', label: '₹75,000 - ₹1,50,000', min: 75000, max: 150000 },
    { id: 'above-150k', label: 'Above ₹1,50,000', min: 150000, max: Infinity },
];

const TYPE_FILTERS = [
    { id: 'all', label: 'All Origins' },
    { id: 'natural', label: 'Natural Diamonds' },
    { id: 'lab_grown', label: 'Lab-Grown' },
];

// Helper to determine the most fitting fallback image matching the product's design/category
const getDiamondDesignFallback = (product = {}) => {
    const name = String(product?.name || '').toLowerCase();
    const cat = String(product?.category?.name || product?.category || product?.categorySlug || '').toLowerCase();
    const search = `${name} ${cat}`;

    if (search.includes('ring') || search.includes('solitaire') || search.includes('band')) {
        return ringFallbackImg;
    }
    if (search.includes('necklace') || search.includes('pendant') || search.includes('choker') || search.includes('chain')) {
        return necklaceFallbackImg;
    }
    if (search.includes('bangle') || search.includes('bracelet') || search.includes('cuff') || search.includes('kada')) {
        return braceletFallbackImg;
    }
    if (search.includes('earring') || search.includes('stud') || search.includes('drop') || search.includes('hoop')) {
        return earringFallbackImg;
    }
    return roundDiamondImg;
};

// Subcomponent: Individual Luxury Diamond Product Card
const DiamondProductCard = ({ product }) => {
    const navigate = useNavigate();
    const fallbackImage = useMemo(() => getDiamondDesignFallback(product), [product]);

    // Derive primary image from product uploaded through Admin Panel
    const rawImage = useMemo(() => {
        if (Array.isArray(product?.images) && product.images.length > 0) {
            const first = product.images.find(img => typeof img === 'string' && img.trim().length > 0)
                || product.images[0]?.url
                || product.images[0];
            if (first) return getProductCardUrl(first);
        }
        if (product?.image && typeof product.image === 'string' && product.image.trim().length > 0) {
            return getProductCardUrl(product.image);
        }
        if (Array.isArray(product?.variants)) {
            for (const v of product.variants) {
                if (Array.isArray(v?.variantImages) && v.variantImages.length > 0) {
                    const vImg = v.variantImages[0];
                    if (vImg) return getProductCardUrl(vImg);
                }
            }
        }
        return fallbackImage;
    }, [product, fallbackImage]);

    const [imgSrc, setImgSrc] = useState(rawImage || fallbackImage);
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
        if (!imgError) {
            setImgError(true);
            setImgSrc(fallbackImage);
        }
    };

    const effectivePrice = getProductPrice(product);
    const effectiveMRP = getProductMRP(product);
    const hasDiscount = effectiveMRP > effectivePrice;
    const discountPercent = hasDiscount
        ? Math.round(((effectiveMRP - effectivePrice) / effectiveMRP) * 100)
        : 0;

    // Diamond origin derivation
    const diamondOrigin = useMemo(() => {
        const dType = String(product?.diamondType || '').toLowerCase();
        if (dType === 'natural') return 'Natural Diamond';
        if (dType === 'lab_grown') return 'Lab-Grown';
        const vType = Array.isArray(product?.variants)
            ? product.variants.find(v => v?.diamondType === 'natural' || v?.diamondType === 'lab_grown')?.diamondType
            : null;
        if (vType === 'natural') return 'Natural Diamond';
        if (vType === 'lab_grown') return 'Lab-Grown';
        return 'Certified Diamond';
    }, [product]);

    const diamondSpecs = useMemo(() => {
        const specs = product?.variants?.[0]?.diamondSpecs || product?.diamondSpecs;
        const details = [];
        if (specs?.carat) details.push(`${specs.carat} ct`);
        if (specs?.clarity) details.push(specs.clarity);
        if (specs?.color) details.push(specs.color);
        if (specs?.shape) details.push(`${specs.shape}`);
        if (details.length > 0) return details.join(' • ');

        const setting = product?.settingMetal || product?.variants?.[0]?.settingMetal;
        if (setting) return `Setting: ${setting}`;
        return null;
    }, [product]);

    const handleOpen = (e) => {
        e?.preventDefault?.();
        navigate(`/product/${product.id || product._id || product.slug}`);
    };

    return (
        <div
            onClick={handleOpen}
            className="group/card relative w-full flex flex-col bg-white overflow-hidden rounded-2xl sm:rounded-3xl border border-[#F0DDE3] hover:border-brand-champagne transition-all duration-400 hover:shadow-[0_14px_36px_rgba(184,149,106,0.12)] cursor-pointer transform hover:-translate-y-1"
        >
            {/* Visual Area with smooth 1.05 hover zoom */}
            <div className="relative aspect-square w-full overflow-hidden bg-brand-pearl border-b border-[#F0DDE3]">
                <img
                    src={imgSrc}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="w-full h-full object-cover object-center transition-transform duration-350 ease-out group-hover/card:scale-105 motion-reduce:transform-none"
                />

                {/* Ambient Soft Vignette on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Diamond Origin Badge */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10 flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#F0DDE3] text-brand-espresso text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                        <AlankarJewelleryMark className="w-2.5 h-2.5 text-brand-champagne" />
                        <span>{diamondOrigin}</span>
                    </span>
                    {hasDiscount && discountPercent > 0 && (
                        <span className="self-start px-2 py-0.5 rounded-md bg-brand-champagne text-brand-espresso text-[9px] font-black uppercase tracking-wider shadow-2xs">
                            {discountPercent}% Off
                        </span>
                    )}
                </div>

                {/* Quick Action Preview Disc */}
                <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/card:translate-y-0">
                    <button
                        type="button"
                        onClick={handleOpen}
                        aria-label="View Details"
                        className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-[#F0DDE3] text-brand-espresso hover:text-brand-champagne hover:border-brand-champagne flex items-center justify-center shadow-xs cursor-pointer"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Editorial Information Hierarchy */}
            <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                <div>
                    {/* Category or Diamond Specs Subhead */}
                    <div className="flex items-center justify-between mb-1.5 min-h-[16px]">
                        <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-brand-champagne truncate">
                            {product.category?.name || product.category || 'Diamond Atelier'}
                        </span>
                        {diamondSpecs && (
                            <span className="text-[10px] text-[#8B6874] font-medium tracking-tight truncate ml-2">
                                {diamondSpecs}
                            </span>
                        )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-serif text-sm sm:text-base font-medium text-brand-espresso group-hover/card:text-brand-champagne transition-colors leading-snug line-clamp-1 mb-2.5">
                        {product.name}
                    </h3>
                </div>

                <div>
                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base sm:text-lg font-bold text-brand-espresso font-sans tracking-tight">
                            {formatCurrency(effectivePrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-stone-400 line-through font-normal">
                                {formatCurrency(effectiveMRP)}
                            </span>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="w-full py-2 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl bg-brand-plum text-brand-pearl group-hover/card:bg-brand-champagne group-hover/card:text-brand-espresso font-sans font-semibold text-[10px] sm:text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-brand-espresso group-hover/card:border-brand-champagne"
                    >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ExploreDiamondCollection = ({
    sectionData,
    diamondProducts = [],
    selectedShape = null,
    onSelectShape = null
}) => {
    const settings = sectionData?.settings || {};
    const title = settings.title || 'Explore Our Diamond Collection';
    const subtitle = settings.subtitle || 'Handcrafted certified solitaires, fine diamond rings, and heirloom creations shaped by master artisans for milestone moments.';
    const eyebrow = settings.eyebrow || 'Atelier Showcase';

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [sortBy, setSortBy] = useState('featured');

    // Filter & sort logic for diamond collection
    const filteredProducts = useMemo(() => {
        let result = [...diamondProducts];

        // 1. Category Filter
        if (selectedCategory !== 'all') {
            result = result.filter((p) => {
                const catName = String(p.category?.name || p.category || '').toLowerCase();
                const catSlug = String(p.categorySlug || p.category?.slug || '').toLowerCase();
                const pName = String(p.name || '').toLowerCase();
                const target = String(selectedCategory).toLowerCase();
                return catName.includes(target) || catSlug.includes(target) || pName.includes(target);
            });
        }

        // 2. Diamond Origin Filter
        if (selectedType !== 'all') {
            result = result.filter((p) => {
                const dType = String(p.diamondType || '').toLowerCase();
                const hasVariantType = Array.isArray(p.variants) && p.variants.some((v) =>
                    String(v.diamondType || '').toLowerCase() === selectedType
                );
                const nameMatch = String(p.name || '').toLowerCase().includes(selectedType.replace('_', ' '));
                return dType === selectedType || hasVariantType || nameMatch;
            });
        }

        // 3. Shape Filter
        if (selectedShape) {
            result = result.filter((p) => {
                const shapeStr = String(selectedShape).toLowerCase();
                const pName = String(p.name || '').toLowerCase();
                const pDesc = String(p.description || '').toLowerCase();
                const hasVariantShape = Array.isArray(p.variants) && p.variants.some((v) =>
                    String(v.diamondSpecs?.shape || v.shape || '').toLowerCase().includes(shapeStr)
                );
                return pName.includes(shapeStr) || pDesc.includes(shapeStr) || hasVariantShape;
            });
        }

        // 4. Price Tier Filter
        if (selectedPrice !== 'all') {
            const tier = PRICE_TIERS.find((t) => t.id === selectedPrice);
            if (tier) {
                result = result.filter((p) => {
                    const price = getProductPrice(p);
                    return price >= tier.min && price <= tier.max;
                });
            }
        }

        // 5. Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
                break;
            case 'price-high':
                result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            default:
                break;
        }

        return result;
    }, [diamondProducts, selectedCategory, selectedType, selectedShape, selectedPrice, sortBy]);

    const hasActiveFilters = selectedCategory !== 'all' || selectedType !== 'all' || selectedPrice !== 'all' || selectedShape !== null;

    const resetAllFilters = () => {
        setSelectedCategory('all');
        setSelectedType('all');
        setSelectedPrice('all');
        if (onSelectShape) onSelectShape(null);
    };

    return (
        <section id="diamond-catalogue" className="py-14 sm:py-18 md:py-24 bg-gradient-to-b from-[#FFF9FA] via-[#FFFBFC] to-[#FFF9FA] border-t border-b border-[#E8DFD1] overflow-hidden">
            <div className="max-w-[1460px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Section Header ────────────────────────────────────── */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                    {/* Top Diamond Emblem */}
                    <div className="flex items-center justify-center gap-3 mb-2.5">
                        <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-r from-transparent to-brand-champagne/70" />
                        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-brand-champagne" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="6 3 18 3 22 9 12 22 2 9" />
                        </svg>
                        <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-l from-transparent to-brand-champagne/70" />
                    </div>

                    {/* Eyebrow */}
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.26em] text-[#8B6874] block mb-2 font-sans">
                        {eyebrow}
                    </span>

                    {/* Main Title */}
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] text-brand-espresso font-normal tracking-tight leading-tight mb-3">
                        {title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm md:text-[15px] text-[#7F626C] font-light leading-relaxed max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </div>

                {/* ── Luxury Filter Controls ────────────────────────────── */}
                <div className="space-y-4 mb-8 sm:mb-10">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
                        {CATEGORY_TABS.map((tab) => {
                            const isActive = selectedCategory === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(tab.id)}
                                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${isActive
                                        ? 'bg-brand-plum text-white shadow-xs scale-[1.02]'
                                        : 'bg-white text-stone-700 hover:text-brand-espresso hover:border-brand-champagne border border-[#F0DDE3]'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sub-Filters: Origin, Price, Shape & Sort */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Origin Filter */}
                            <div className="flex items-center gap-1.5 bg-white border border-[#F0DDE3] rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Origin:</span>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-brand-espresso outline-none cursor-pointer"
                                >
                                    {TYPE_FILTERS.map((t) => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="flex items-center gap-1.5 bg-white border border-[#F0DDE3] rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Price:</span>
                                <select
                                    value={selectedPrice}
                                    onChange={(e) => setSelectedPrice(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-brand-espresso outline-none cursor-pointer"
                                >
                                    {PRICE_TIERS.map((tier) => (
                                        <option key={tier.id} value={tier.id}>{tier.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Active Shape Chip */}
                            {selectedShape && (
                                <div className="inline-flex items-center gap-1.5 bg-brand-plum text-white px-3 py-1.5 rounded-xl text-xs font-semibold">
                                    <span className="capitalize">{selectedShape} Cut</span>
                                    <button
                                        type="button"
                                        onClick={() => onSelectShape && onSelectShape(null)}
                                        className="text-stone-400 hover:text-white cursor-pointer ml-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Counter, Reset & Sort */}
                        <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto text-xs">
                            <span className="text-stone-500 font-medium hidden sm:inline">
                                Showing <strong className="text-stone-900">{filteredProducts.length}</strong> of {diamondProducts.length} designs
                            </span>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    className="inline-flex items-center gap-1 text-brand-champagne hover:underline font-bold uppercase text-[11px] tracking-wider cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                            )}

                            {/* Sort Dropdown */}
                            <div className="relative bg-white border border-[#F0DDE3] rounded-xl px-3 py-1.5 text-xs shadow-2xs">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-brand-espresso outline-none cursor-pointer pr-1"
                                >
                                    <option value="featured">Featured Creations</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">New Arrivals</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Product Grid or Polished Empty State ───────────────── */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
                        {filteredProducts.map((product) => (
                            <DiamondProductCard
                                key={product.id || product._id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 sm:py-20 px-6 max-w-xl mx-auto text-center bg-white/80 backdrop-blur-xs rounded-3xl border border-[#F0DDE3] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                        <div className="w-16 h-16 rounded-2xl bg-[#FFF9FA] border border-[#F0DDE3] flex items-center justify-center mx-auto mb-4 text-brand-champagne shadow-2xs">
                            <Gem className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif text-xl sm:text-2xl text-brand-espresso font-medium mb-2">
                            No Diamond Designs Found
                        </h3>
                        <p className="text-xs sm:text-sm text-[#786E64] font-light leading-relaxed mb-6 max-w-md mx-auto">
                            {hasActiveFilters
                                ? "No certified diamond jewellery matching your selected filters is currently available."
                                : "Our master atelier is actively handcrafting new certified diamond solitaires and bespoke fine jewellery pieces."}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#F0DDE3] text-brand-espresso hover:border-brand-champagne hover:text-brand-champagne transition-all cursor-pointer shadow-2xs"
                                >
                                    Reset Filters
                                </button>
                            )}
                            <Link
                                to="/shop?metal=diamond"
                                className="inline-flex items-center gap-2 bg-brand-plum text-white hover:bg-brand-champagne hover:text-brand-espresso px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                            >
                                <span>Browse Full Store Catalogue</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ExploreDiamondCollection;
