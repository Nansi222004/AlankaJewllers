import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import customer1 from '@assets/testimonial_customer_1.png';
import customer2 from '@assets/testimonial_customer_2.png';
import customer3 from '@assets/testimonial_customer_3.png';

const GOLD_TESTIMONIALS = [
    {
        id: 1,
        name: 'Shashi',
        subtitle: 'Verified Buyer',
        location: 'Mumbai',
        rating: 5,
        image: customer1,
        text: 'This time for our 5th year anniversary I wanted to gift her something different. Glad I got to custom make a modern solitaire ring for her...simple yet different, and exactly what I had pictured.'
    },
    {
        id: 2,
        name: 'Renuka',
        subtitle: 'Verified Buyer',
        location: 'Mumbai',
        rating: 5,
        image: customer2,
        text: 'Most gold rings for men look dated. I wanted to gift him something that matches the wedding ring he got me too. Finally got to know Alankarrr Jewellers\'s gold made-to-order option.'
    },
    {
        id: 3,
        name: 'Priya',
        subtitle: 'Verified Buyer',
        location: 'Mumbai',
        rating: 5,
        image: customer3,
        text: 'Wanted something special and matchy for my sister. So I got these rings custom-made with our coloured diamonds. And well, diamonds are a girl\'s best friend for a reason!'
    }
];

const GoldTestimonials = ({ sectionData = null }) => {
    const scrollRef = useRef(null);
    const [showArrows, setShowArrows] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const testimonials = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length === 0) return GOLD_TESTIMONIALS;

        return configured.map((item, idx) => ({
            id: item?.itemId || item?.id || `gold-testimonial-${idx + 1}`,
            name: item?.name || GOLD_TESTIMONIALS[idx % GOLD_TESTIMONIALS.length].name,
            subtitle: item?.subtitle || GOLD_TESTIMONIALS[idx % GOLD_TESTIMONIALS.length].subtitle || '',
            location: item?.location || GOLD_TESTIMONIALS[idx % GOLD_TESTIMONIALS.length].location || '',
            rating: Number(item?.rating) || 5,
            image: resolveLegacyCmsAsset(item?.image, GOLD_TESTIMONIALS[idx % GOLD_TESTIMONIALS.length].image),
            text: item?.description || item?.text || GOLD_TESTIMONIALS[idx % GOLD_TESTIMONIALS.length].text
        }));
    }, [sectionData]);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        setShowArrows(scrollWidth > clientWidth);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [testimonials]);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const heading = String(sectionData?.settings?.title || sectionData?.label || 'Client Stories & Cherished Moments').trim();

    return (
        <section className="w-full pt-10 pb-14 bg-brand-pearl/60 border-b border-brand-border-soft overflow-hidden select-none relative">
            <div className="container mx-auto px-4 mb-8 text-center">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-1.5 block">
                    Real Customer Love
                </span>
                <h2 className="text-[26px] md:text-[38px] font-serif text-brand-espresso font-normal leading-tight">
                    {heading}
                </h2>
                <div className="h-px w-16 bg-brand-champagne/40 mx-auto mt-3" />
            </div>

            <div className="relative group max-w-[1450px] mx-auto">
                <AnimatePresence>
                    {showArrows && canScrollLeft && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => scroll('left')}
                            className="absolute left-4 top-[100px] md:top-[120px] z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs border border-brand-border text-brand-espresso flex items-center justify-center shadow-md hover:bg-brand-rosewater/30 hover:border-brand-champagne transition-all hidden md:flex cursor-pointer"
                            aria-label="Scroll testimonials left"
                        >
                            <ChevronLeft size={20} className="text-brand-espresso" />
                        </motion.button>
                    )}

                    {showArrows && canScrollRight && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => scroll('right')}
                            className="absolute right-4 top-[100px] md:top-[120px] z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-xs border border-brand-border text-brand-espresso flex items-center justify-center shadow-md hover:bg-brand-rosewater/30 hover:border-brand-champagne transition-all hidden md:flex cursor-pointer"
                            aria-label="Scroll testimonials right"
                        >
                            <ChevronRight size={20} className="text-brand-espresso" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className={`flex overflow-x-auto gap-8 px-6 md:px-12 pb-12 scrollbar-hide snap-x snap-mandatory ${!showArrows ? 'md:justify-center' : 'justify-start'}`}
                >
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="flex-shrink-0 w-[260px] md:w-[310px] snap-center flex flex-col"
                        >
                            <div className="bg-white rounded-[24px] p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[220px] md:min-h-[260px] relative border border-brand-border">
                                {/* Rating Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={13}
                                            className={`${i < item.rating ? 'text-brand-champagne fill-brand-champagne' : 'text-brand-border'}`}
                                        />
                                    ))}
                                </div>

                                <p className="text-brand-espresso/90 font-serif italic text-sm md:text-[15px] leading-relaxed mb-4">
                                    "{item.text}"
                                </p>

                                <div className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 w-18 h-18 md:w-22 md:h-22 rounded-full overflow-hidden border-4 border-brand-porcelain shadow-sm z-10 bg-white">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="mt-14 md:mt-16 text-center">
                                <h4 className="text-brand-espresso font-serif font-medium text-base md:text-lg">
                                    {item.name}
                                </h4>
                                {(item.subtitle || item.location) && (
                                    <p className="text-brand-taupe text-[10px] md:text-xs uppercase tracking-widest mt-1 font-medium">
                                        {[item.subtitle, item.location].filter(Boolean).join(' • ')}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </section>
    );
};

export default GoldTestimonials;
