import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import goldRingsLight from '@assets/categories/gold_rings_light.png';

const HeerCustomisationBanner = () => {
    const [selectedPurity, setSelectedPurity] = useState('14kt');

    return (
        <section className="py-6 md:py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1250px]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative w-full rounded-[1.5rem] md:rounded-[2.5rem] bg-brand-porcelain border border-brand-border p-6 sm:p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 shadow-xs"
                >
                    {/* Left Branding Content */}
                    <div className="flex-1 text-center lg:text-left z-10">
                        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-2 block">
                            Bespoke Jewellery
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-serif font-normal text-brand-espresso leading-tight tracking-tight">
                            Colour • Size • Metal
                        </h2>
                        <p className="text-sm md:text-base text-brand-taupe font-normal mt-3 mb-5 max-w-md mx-auto lg:mx-0">
                            Choose your perfect ring crafted precisely to your personal preferences and style.
                        </p>

                        <div className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-xs border border-brand-border px-4 py-2 rounded-full shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-brand-champagne animate-pulse"></span>
                            <span className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-brand-espresso">
                                Takes 18 days to deliver
                            </span>
                        </div>
                    </div>

                    {/* Center Interactive Ring Visual */}
                    <div className="relative w-full lg:w-[42%] flex flex-col items-center justify-center my-2 lg:my-0">
                        {/* Light Ring Showcase with Callout badges */}
                        <div className="relative w-[210px] h-[210px] sm:w-[250px] sm:h-[250px] md:w-[280px] md:h-[280px] flex items-center justify-center">
                            {/* Subtle Ambient Glow */}
                            <div className="absolute inset-0 rounded-full bg-brand-champagne/10 blur-xl scale-95 pointer-events-none" />

                            {/* Circular Pedestal Card */}
                            <div className="relative z-10 w-full h-full rounded-full border border-brand-border bg-white p-3 shadow-md flex items-center justify-center overflow-hidden">
                                <img
                                    src={goldRingsLight}
                                    alt="Customisable Ring"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>

                            {/* Editorial Spec Callouts */}
                            <div className="absolute -top-1 left-0 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-brand-border shadow-xs">
                                <span className="text-[8px] font-bold text-brand-taupe uppercase tracking-wider block">Size</span>
                                <span className="text-xs font-semibold text-brand-espresso">11 (Custom)</span>
                            </div>

                            <div className="absolute top-2 right-0 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-brand-border shadow-xs">
                                <span className="text-[8px] font-bold text-brand-taupe uppercase tracking-wider block">Metal</span>
                                <span className="text-xs font-semibold text-brand-espresso">{selectedPurity.toUpperCase()} Gold</span>
                            </div>

                            <div className="absolute -bottom-2 right-2 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-brand-border shadow-xs">
                                <span className="text-[8px] font-bold text-brand-taupe uppercase tracking-wider block">Colour</span>
                                <span className="text-xs font-semibold text-brand-champagne">Yellow Gold</span>
                            </div>
                        </div>

                        {/* Purity Toggles */}
                        <div className="mt-5 flex items-center gap-1.5 bg-white p-1 rounded-full border border-brand-border shadow-xs z-30">
                            {['9kt', '14kt', '18kt'].map((k) => (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => setSelectedPurity(k)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${selectedPurity === k
                                        ? 'bg-brand-champagne text-white shadow-2xs'
                                        : 'text-brand-taupe hover:text-brand-espresso hover:bg-brand-pearl'
                                        }`}
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Action Content */}
                    <div className="flex-1 flex flex-col items-center lg:items-end text-center lg:text-right z-10">
                        <div className="mb-4">
                            <span className="text-xs md:text-sm font-serif italic text-brand-taupe block mb-1">
                                Personalized Perfection
                            </span>
                            <h3 className="text-lg md:text-xl font-medium text-brand-espresso">
                                Tailored to You
                            </h3>
                        </div>

                        <Link to="/customization" className="inline-block">
                            <button className="group relative flex items-center gap-2 bg-brand-plum hover:bg-brand-espresso text-brand-champagne-light px-7 py-3.5 rounded-full font-medium uppercase tracking-[0.16em] text-[11px] md:text-[12px] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer border border-brand-champagne/30">
                                Customise Now
                                <ChevronRight className="w-3.5 h-3.5 text-brand-champagne transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </Link>

                        <div className="mt-6 flex flex-col items-center lg:items-end">
                            <div className="flex items-center gap-2">
                                <span className="h-px w-5 bg-brand-champagne/40" />
                                <span className="font-serif italic text-base text-brand-espresso">Alankarrr</span>
                                <span className="h-px w-5 bg-brand-champagne/40" />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-brand-champagne mt-0.5">
                                Atelier Custom
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeerCustomisationBanner;
