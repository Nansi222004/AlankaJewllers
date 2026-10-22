import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';
import { useHomepageCms } from '../hooks/useHomepageCms';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';
import { IMAGE_FALLBACKS, handleImageError } from '../../../utils/imageFallbacks';

const DynamicPromoBanner = () => {
    const { data: homepageSections = {} } = useHomepageCms();
    const sectionData = homepageSections?.['dynamic-promo-banner'];

    const bannerItems = useMemo(() => {
        const items = Array.isArray(sectionData?.items) ? sectionData.items : [];
        return items
            .filter((item) => Boolean(String(item?.image || '').trim()) && Boolean(String(item?.mobileImage || '').trim()))
            .filter((item) => {
                const label = String(item.label || item.title || '').toLowerCase();
                return !label.includes('unique story in golds') && !label.includes('unique story in gold');
            })
            .map((item, index) => {
                const title = String(item.label || item.title || '').trim();
                const name = String(item.name || '').trim();
                const tag = String(item.tag || '').trim();
                const subtitle = String(item.subtitle || '').trim();
                const ctaLabel = String(item.ctaLabel || '').trim();
                const link = String(item.path || '').trim() || (ctaLabel ? '/shop' : '');

                return {
                    id: item.itemId || item.id || `dynamic-promo-${index + 1}`,
                    image: resolveLegacyCmsAsset(item.image, item.image),
                    mobileImage: resolveLegacyCmsAsset(item.mobileImage, item.mobileImage),
                    link,
                    title,
                    name,
                    tag,
                    subtitle,
                    ctaLabel
                };
            });
    }, [sectionData?.items]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const autoplayMs = Number(sectionData?.settings?.autoplayMs) || 5000;

    useEffect(() => {
        if (bannerItems.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
        }, autoplayMs);
        return () => clearInterval(timer);
    }, [autoplayMs, bannerItems.length]);

    useEffect(() => {
        if (currentIndex >= bannerItems.length) {
            setCurrentIndex(0);
        }
    }, [currentIndex, bannerItems.length]);

    if (bannerItems.length === 0) {
        return null;
    }

    const renderBannerSlide = (banner) => {
        const hasTitle = Boolean(banner.title);
        const hasSubtitle = Boolean(banner.subtitle);
        const hasEyebrow = Boolean(banner.name);
        const hasTag = Boolean(banner.tag);
        const hasMeta = hasEyebrow || hasTag;
        const hasCta = Boolean(banner.ctaLabel);
        const hasTextContent = hasTitle || hasSubtitle || hasMeta;
        const hasAnyContent = hasTextContent || hasCta;

        const content = (
            <>
                {/* ── DESKTOP EDITORIAL / BANNER COMPOSITION (md+) ── */}
                {!hasAnyContent ? (
                    /* CASE 1: Desktop Image + Mobile Image only (Image-only banner) */
                    <div className="hidden md:block w-full aspect-[4/1] bg-brand-plum rounded-3xl overflow-hidden border border-brand-champagne/30 shadow-2xl relative">
                        <img
                            src={banner.image}
                            alt={banner.title || 'Dynamic Promo Banner'}
                            loading="eager"
                            decoding="async"
                            onError={(e) => handleImageError(e, IMAGE_FALLBACKS.editorial)}
                            className="w-full h-full object-cover object-center transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                        />
                    </div>
                ) : !hasTextContent && hasCta ? (
                    /* CASE 4: Desktop Image + Mobile Image + CTA (No title/subtitle/tag, CTA button on image) */
                    <div className="hidden md:block w-full aspect-[4/1] bg-brand-plum rounded-3xl overflow-hidden border border-brand-champagne/30 shadow-2xl relative">
                        <img
                            src={banner.image}
                            alt={banner.title || 'Dynamic Promo Banner'}
                            loading="eager"
                            decoding="async"
                            onError={(e) => handleImageError(e, IMAGE_FALLBACKS.editorial)}
                            className="w-full h-full object-cover object-center transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute bottom-8 left-10 z-10">
                            <span className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-champagne via-[#D8AD38] to-brand-champagne text-brand-espresso font-sans font-bold text-xs uppercase tracking-[0.18em] px-8 py-4 rounded-full shadow-[0_8px_24px_rgba(184,149,106,0.25)] transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(184,149,106,0.4)] group-hover:scale-[1.02]">
                                <span>{banner.ctaLabel}</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </span>
                        </div>
                    </div>
                ) : (
                    /* CASE 2, 3, 5: Desktop with Text Content (Title, Subtitle, Tag, CTA) */
                    <div className="hidden md:grid md:grid-cols-12 w-full min-h-[440px] lg:min-h-[500px] bg-brand-plum rounded-3xl overflow-hidden border border-brand-champagne/30 shadow-2xl relative">
                        {/* Left Wing: Editorial Typography & Copy */}
                        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between p-8 lg:p-14 z-10 relative bg-gradient-to-r from-brand-plum via-[#1A1816] to-brand-plum">
                            <div className="space-y-4">
                                {hasMeta && (
                                    <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-brand-champagne/10 border border-brand-champagne/30 text-brand-champagne-light text-[10px] uppercase font-bold tracking-[0.25em]">
                                        <AlankarJewelleryMark className="w-3 h-3 text-brand-champagne" />
                                        {hasEyebrow && <span>{banner.name}</span>}
                                        {hasEyebrow && hasTag && <span aria-hidden="true">•</span>}
                                        {hasTag && <span>{banner.tag}</span>}
                                    </div>
                                )}

                                {hasTitle && (
                                    <h1 className="font-serif text-3xl lg:text-5xl text-brand-pearl font-normal tracking-tight leading-[1.12]">
                                        {banner.title}
                                    </h1>
                                )}

                                {hasTitle && (hasSubtitle || hasCta) && (
                                    <div className="w-16 h-[2px] bg-gradient-to-r from-brand-champagne to-transparent" />
                                )}

                                {hasSubtitle && (
                                    <p className="text-stone-300 font-sans text-sm lg:text-base font-light leading-relaxed max-w-md pt-2">
                                        {banner.subtitle}
                                    </p>
                                )}
                            </div>

                            {hasCta && (
                                <div className="pt-8">
                                    <span className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-champagne via-[#D8AD38] to-brand-champagne text-brand-espresso font-sans font-bold text-xs uppercase tracking-[0.18em] px-8 py-4 rounded-full shadow-[0_8px_24px_rgba(184,149,106,0.25)] transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(184,149,106,0.4)] group-hover:scale-[1.02]">
                                        <span>{banner.ctaLabel}</span>
                                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right Wing: Large Editorial Jewellery Image */}
                        <div className="md:col-span-6 lg:col-span-7 relative overflow-hidden bg-stone-900">
                            <img
                                src={banner.image}
                                alt={banner.title || 'Dynamic Promo Banner'}
                                loading="eager"
                                decoding="async"
                                onError={(e) => handleImageError(e, IMAGE_FALLBACKS.editorial)}
                                className="w-full h-full object-cover object-center transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                            />
                            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand-plum to-transparent pointer-events-none" />
                            <div className="absolute inset-0 border-l border-brand-champagne/20 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* ── MOBILE EDITORIAL / BANNER COMPOSITION (< md) ── */}
                {!hasAnyContent ? (
                    /* CASE 1: Mobile Image only (Image-only banner at 2:1 ratio) */
                    <div className="block md:hidden w-full aspect-[2/1] bg-brand-plum overflow-hidden rounded-2xl border border-brand-champagne/30 shadow-lg relative">
                        <img
                            src={banner.mobileImage}
                            alt={banner.title || 'Dynamic Promo Banner'}
                            loading="eager"
                            decoding="async"
                            onError={(e) => handleImageError(e, IMAGE_FALLBACKS.editorial)}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    /* CASES 2, 3, 4, 5: Mobile with Optional Content (Tag, Title, Subtitle, CTA) */
                    <div className="block md:hidden w-full bg-brand-plum overflow-hidden rounded-2xl border border-brand-champagne/30 shadow-lg">
                        {/* Visual Banner at recommended 2:1 ratio */}
                        <div className="relative aspect-[2/1] w-full overflow-hidden bg-stone-900">
                            <img
                                src={banner.mobileImage}
                                alt={banner.title || 'Dynamic Promo Banner'}
                                loading="eager"
                                decoding="async"
                                onError={(e) => handleImageError(e, IMAGE_FALLBACKS.editorial)}
                                className="w-full h-full object-cover"
                            />
                            {hasMeta && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-plum via-black/20 to-transparent" />
                                    <div className="absolute top-3 left-3 bg-brand-plum/85 backdrop-blur-sm border border-brand-champagne/40 px-2.5 py-0.5 rounded-full text-brand-champagne-light text-[9px] font-bold uppercase tracking-wider">
                                        {hasEyebrow && <span>{banner.name}</span>}
                                        {hasEyebrow && hasTag && <span aria-hidden="true"> · </span>}
                                        {hasTag && <span>{banner.tag}</span>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Content Box below image - ONLY rendered if hasTitle, hasSubtitle, or hasCta */}
                        {(hasTitle || hasSubtitle || hasCta) && (
                            <div className="p-5 flex flex-col items-start gap-2 bg-brand-plum">
                                {hasTitle && (
                                    <h2 className="font-serif text-xl sm:text-2xl text-brand-pearl font-normal leading-snug tracking-tight">
                                        {banner.title}
                                    </h2>
                                )}

                                {hasSubtitle && (
                                    <p className="text-stone-300 text-xs font-light leading-relaxed line-clamp-2">
                                        {banner.subtitle}
                                    </p>
                                )}

                                {hasCta && (
                                    <div className="w-full pt-3">
                                        <span className="w-full inline-flex items-center justify-center gap-2 bg-brand-champagne text-brand-espresso font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md">
                                            <span>{banner.ctaLabel}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </>
        );

        if (banner.link) {
            return (
                <Link to={banner.link} className="block w-full group focus:outline-none">
                    {content}
                </Link>
            );
        }

        return (
            <div className="block w-full group focus:outline-none">
                {content}
            </div>
        );
    };

    const activeBanner = bannerItems[currentIndex] || bannerItems[0];

    return (
        <section className="w-full bg-[#E7D7DC] py-4 md:py-7 relative border-y border-[#D2BBC3]">
            <div className="container mx-auto px-3 md:px-6 max-w-[1440px]">
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full"
                        >
                            {renderBannerSlide(activeBanner)}
                        </motion.div>
                    </AnimatePresence>

                    {/* Elegant Slide Indicators (When multiple slides exist) */}
                    {bannerItems.length > 1 && (
                        <div className="absolute bottom-3 md:bottom-6 right-6 md:right-10 flex items-center gap-2 z-20">
                            {bannerItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-1.5 transition-all duration-400 rounded-full ${i === currentIndex
                                        ? 'w-8 bg-brand-champagne'
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                        }`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default DynamicPromoBanner;
