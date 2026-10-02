import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { usePublicProductsQuery } from '../hooks/usePublicProductsQuery';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { isGoldProduct } from '../utils/productMetal';

const parsePositiveNumber = (value, fallback = 8) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeToken = (value = '') => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const normalizeIdValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') return String(value._id || value.id || '').trim();
    return String(value).trim();
};

const normalizeCategoryCandidates = (value) => {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    if (typeof value === 'object') {
        return [
            value._id,
            value.id,
            value.slug,
            value.name,
            value.categoryId,
            value.category
        ].filter(Boolean);
    }
    return [String(value)];
};

const parseCategoryFromPath = (path = '') => {
    const source = String(path || '');
    if (!source.includes('category=')) return '';
    const raw = source.split('category=')[1]?.split('&')[0] || '';
    try {
        return decodeURIComponent(raw).trim();
    } catch {
        return raw.trim();
    }
};

const matchesCategory = (product = {}, categoryId = '') => {
    const target = normalizeToken(categoryId);
    if (!target) return true;

    const navCategoryTokens = Array.isArray(product.navShopByCategory)
        ? product.navShopByCategory
            .flatMap((entry) => normalizeCategoryCandidates(entry))
            .map((entry) => normalizeToken(entry))
            .filter(Boolean)
        : [];

    const tokens = new Set([
        normalizeToken(product.categoryId),
        normalizeToken(product.category),
        normalizeToken(product.categorySlug),
        ...navCategoryTokens
    ].filter(Boolean));
    return tokens.has(target);
};

const GoldDirectProducts = ({ sectionData = null }) => {
    const { products: contextProducts } = useShop();
    const [sortOption, setSortOption] = useState('newest');

    const resolvedSettings = useMemo(() => {
        const settings = sectionData?.settings || {};
        const sourceMode = settings.sourceMode === 'manual' ? 'manual' : 'category';
        const categoryFromPath = parseCategoryFromPath(sectionData?.items?.[0]?.path);

        const rawTitle = String(settings.title || sectionData?.label || '').trim();
        const title = (!rawTitle || rawTitle.toLowerCase() === 'all jewellery' || rawTitle.toLowerCase() === 'curated showcase')
            ? 'Shop Gold Jewellery'
            : rawTitle;

        return {
            title,
            subtitle: String(settings.subtitle || settings.description || 'Explore our collection of gold jewellery, crafted for everyday elegance and special moments.').trim(),
            eyebrow: String(settings.eyebrow || 'Pure Radiance').trim() || 'Pure Radiance',
            productLimit: parsePositiveNumber(settings.productLimit, 8),
            sourceMode,
            categoryId: String(settings.categoryId || categoryFromPath || '').trim()
        };
    }, [sectionData]);

    // Query genuine gold products via the dedicated endpoint
    const { data: apiData, isLoading } = usePublicProductsQuery({
        metal: 'gold',
        inStockOnly: true,
        sort: sortOption,
        page: 1,
        limit: Math.max(resolvedSettings.productLimit, 12),
    });

    const displayProducts = useMemo(() => {
        const apiProducts = Array.isArray(apiData?.products) ? apiData.products : [];
        const shopProducts = Array.isArray(contextProducts) ? contextProducts : [];

        // Pool products without duplicates
        const combinedMap = new Map();
        [...apiProducts, ...shopProducts].forEach((p) => {
            const id = String(p?._id || p?.id || '');
            if (id && !combinedMap.has(id)) {
                combinedMap.set(id, p);
            }
        });
        const allCandidates = Array.from(combinedMap.values());

        // Strictly filter for genuine gold products using approved logic
        const goldProducts = allCandidates.filter((p) => isGoldProduct(p));

        if (resolvedSettings.sourceMode === 'manual') {
            const pinnedIds = (Array.isArray(sectionData?.items) ? sectionData.items : [])
                .flatMap((item) => {
                    const ids = [];
                    const primary = normalizeIdValue(item?.productId);
                    if (primary) ids.push(primary);
                    if (Array.isArray(item?.productIds)) {
                        ids.push(...item.productIds.map((id) => normalizeIdValue(id)).filter(Boolean));
                    }
                    return ids;
                })
                .filter(Boolean);

            const pinnedMap = new Map(allCandidates.map((product) => [String(product.id || product._id), product]));
            const manualProducts = pinnedIds
                .map((id) => pinnedMap.get(String(id)))
                .filter((product) => Boolean(product) && isGoldProduct(product))
                .slice(0, resolvedSettings.productLimit);

            if (manualProducts.length > 0) return manualProducts;
        }

        const filtered = resolvedSettings.categoryId
            ? goldProducts.filter((product) => matchesCategory(product, resolvedSettings.categoryId))
            : goldProducts;

        // Apply sort if sorting locally
        if (sortOption === 'price-asc') {
            filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (sortOption === 'price-desc') {
            filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (sortOption === 'most-sold') {
            filtered.sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));
        }

        return filtered.slice(0, resolvedSettings.productLimit);
    }, [apiData, contextProducts, sectionData, resolvedSettings, sortOption]);

    return (
        <section className="w-full py-10 md:py-16 bg-brand-pearl/50 border-t border-brand-border-soft">
            <div className="max-w-[1450px] mx-auto px-4 md:px-6">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
                    <div className="text-center md:text-left">
                        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-1.5 block">
                            {resolvedSettings.eyebrow}
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-espresso font-normal leading-tight tracking-tight">
                            {resolvedSettings.title}
                        </h2>
                        {resolvedSettings.subtitle && (
                            <p className="text-xs sm:text-sm text-brand-taupe mt-2 max-w-xl">
                                {resolvedSettings.subtitle}
                            </p>
                        )}
                        <div className="h-px w-16 bg-brand-champagne/40 mt-3 mx-auto md:mx-0" />
                    </div>

                    {/* Compact Filter / Sort */}
                    <div className="flex items-center justify-center md:justify-end gap-2 shrink-0">
                        <div className="relative inline-flex items-center">
                            <span className="text-[11px] text-brand-taupe uppercase tracking-wider mr-2 font-medium hidden sm:inline">
                                Sort By:
                            </span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-white border border-brand-border text-brand-espresso text-xs rounded-full px-3.5 py-1.5 focus:border-brand-champagne focus:outline-none shadow-2xs cursor-pointer font-medium"
                                aria-label="Sort gold products"
                            >
                                <option value="newest">Newest Drops</option>
                                <option value="most-sold">Popular</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading Skeletons */}
                {isLoading && displayProducts.length === 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
                        {[...Array(4)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Product Grid: 4 columns on desktop, 2-3 on tablet, 2 on mobile */}
                {displayProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
                            {displayProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id || product._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className="h-full flex"
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>

                        {/* View All Gold CTA */}
                        <div className="mt-10 md:mt-14 flex justify-center">
                            <Link
                                to="/shop?metal=gold"
                                className="inline-flex items-center gap-2 bg-brand-plum text-brand-champagne-light hover:bg-brand-espresso font-medium text-xs md:text-sm px-8 py-3.5 rounded-full border border-brand-champagne/30 transition-all duration-300 shadow-xs hover:shadow-md tracking-[0.18em] uppercase"
                            >
                                View All Gold Jewellery <ArrowRight className="w-4 h-4 text-brand-champagne" />
                            </Link>
                        </div>
                    </>
                ) : !isLoading ? (
                    /* Architecture Ready State when DB has 0 verified gold items */
                    <div className="text-center py-12 px-6 rounded-2xl bg-white border border-brand-border max-w-xl mx-auto shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-2 block">
                            Artisanal Atelier
                        </span>
                        <h3 className="text-lg md:text-xl font-serif text-brand-espresso mb-2 font-normal">
                            Gold Jewellery Coming Soon
                        </h3>
                        <p className="text-xs md:text-sm text-brand-taupe mb-6 max-w-md mx-auto leading-relaxed">
                            Explore our collection of genuine gold jewellery as new pieces arrive.
                        </p>
                        <Link
                            to="/shop?metal=gold"
                            className="inline-flex items-center gap-2 bg-brand-plum text-brand-champagne-light hover:bg-brand-espresso px-7 py-3 rounded-full text-xs font-medium uppercase tracking-[0.16em] transition-all shadow-xs border border-brand-champagne/30"
                        >
                            View All Gold Jewellery <ArrowRight className="w-3.5 h-3.5 text-brand-champagne" />
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default GoldDirectProducts;
