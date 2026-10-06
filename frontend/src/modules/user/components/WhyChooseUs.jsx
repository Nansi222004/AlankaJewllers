import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Sun } from 'lucide-react';
import AlankarJewelleryMark from './AlankarJewelleryMark';

const WhyChooseUs = () => {
    const commitments = [
        {
            icon: AlankarJewelleryMark,
            title: "Pure 925",
            subtitle: "SILVER",
            text: "Certified Authenticity"
        },
        {
            icon: RotateCcw,
            title: "30-Day Easy",
            subtitle: "RETURN",
            text: "Hassle-free Refund"
        },
        {
            icon: Truck,
            title: "Free Delivery",
            subtitle: "ABOVE ₹999",
            text: "Reliable Shipping"
        },
        {
            icon: ShieldCheck,
            title: "T&C Apply",
            subtitle: "SECURE SHOP",
            text: "Safe & Protected"
        }
    ];

    return (
        <section className="py-7 md:py-20 bg-white overflow-hidden border-t border-brand-border/60">
            <div className="container mx-auto px-4 md:px-6 max-w-[1400px]">
                {/* Section Header */}
                <div className="text-center mb-5 md:mb-16 relative">
                    <span className="text-[9px] md:text-[11px] font-bold text-brand-champagne uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1.5 md:mb-3 block">
                        The AlankarJewellers Touch
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-5xl font-display text-brand-espresso relative inline-block">
                        Why Choose Us
                        <div className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-champagne to-transparent opacity-50" />
                    </h2>
                </div>

                {/* ── MOBILE COMPACT 2-COLUMN TRUST GRID (< md) ── */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:hidden">
                    {commitments.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center text-center p-3 sm:p-3.5 bg-brand-pearl/60 rounded-2xl border border-brand-champagne/25 shadow-xs"
                            style={{ minHeight: '115px' }}
                        >
                            {/* Compact Icon Circle */}
                            <div className="w-10 h-10 rounded-full bg-white border border-brand-champagne/40 flex items-center justify-center text-brand-champagne mb-2 shadow-2xs">
                                <item.icon className="w-5 h-5" />
                            </div>

                            {/* Typography */}
                            <div className="space-y-0.5 max-w-full px-1">
                                <span className="text-[8.5px] font-sans font-bold uppercase tracking-[0.2em] text-brand-champagne block truncate">
                                    {item.subtitle}
                                </span>
                                <h3 className="font-serif text-[12.5px] sm:text-[13px] font-semibold text-brand-espresso leading-snug tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-stone-500 font-sans text-[10px] leading-tight truncate opacity-85 font-light">
                                    {item.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── DESKTOP ARCHED COMMITMENTS GRID (md+) ── */}
                <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {commitments.map((item, index) => (
                        <div key={index} className="flex flex-col items-center group relative pt-12 pb-8 px-6 animate-in fade-in slide-in-from-bottom-12 duration-700" style={{ animationDelay: `${index * 150}ms` }}>

                            {/* Decorative Arch Border */}
                            <div className="absolute inset-x-0 inset-y-0 border border-brand-champagne/25 rounded-t-full rounded-b-2xl group-hover:border-brand-champagne/60 transition-colors duration-500 shadow-sm" />

                            {/* Corner Sunburst Accents */}
                            <div className="absolute top-8 left-6 text-brand-champagne/40 group-hover:text-brand-champagne/80 transition-all group-hover:rotate-45 duration-700">
                                <Sun className="w-4 h-4" />
                            </div>
                            <div className="absolute top-8 right-6 text-brand-champagne/40 group-hover:text-brand-champagne/80 transition-all group-hover:-rotate-45 duration-700">
                                <Sun className="w-4 h-4" />
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-brand-champagne/30">
                                <Sun className="w-2.5 h-2.5" />
                            </div>

                            {/* Center Content */}
                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Icon with floating effect */}
                                <div className="mb-8 p-4 rounded-full bg-brand-pearl text-brand-champagne border border-brand-border group-hover:scale-110 group-hover:bg-brand-plum group-hover:text-brand-champagne-light group-hover:border-brand-champagne transition-all duration-500 shadow-sm">
                                    <item.icon className="w-7 h-7" />
                                </div>

                                {/* Title with Brush Stroke Effect */}
                                <div className="relative mb-3 inline-block px-4">
                                    <div className="absolute inset-0 bg-brand-champagne/15 blur-xl rounded-full scale-150 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <h3 className="font-serif italic text-2xl text-brand-espresso transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                </div>

                                {/* Subtitle & Description */}
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-champagne group-hover:text-brand-espresso transition-colors">{item.subtitle}</h4>
                                    <p className="text-[11px] text-stone-500 font-medium tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">{item.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
