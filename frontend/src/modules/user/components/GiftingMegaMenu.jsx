import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User, Heart, Users } from 'lucide-react';
import AlankaJewelleryMark from './AlankaJewelleryMark';

const GiftingMegaMenu = ({ resetMenu, availableHeight, maxWidth }) => {
    const giftOptions = [
        {
            id: 'her',
            title: 'GIFT FOR HER',
            subtitle: "Timeless pieces she'll cherish",
            path: '/category/women',
            icon: Heart,
            tag: 'Graceful & Precious',
        },
        {
            id: 'him',
            title: 'GIFT FOR HIM',
            subtitle: 'Thoughtful jewellery for him',
            path: '/category/men',
            icon: User,
            tag: 'Sophisticated & Bold',
        },
        {
            id: 'family',
            title: 'GIFT FOR FAMILY',
            subtitle: 'Celebrate every family occasion',
            path: '/category/family',
            icon: Users,
            tag: 'Cherished Moments',
        },
    ];

    return (
        <div 
            className="bg-white w-[680px] max-w-[calc(100vw-2rem)] min-w-0 shadow-2xl border border-brand-border overflow-hidden relative rounded-b-2xl flex flex-col"
            style={{
                maxHeight: availableHeight ? `${availableHeight}px` : 'min(440px, calc(100vh - 140px))',
                width: maxWidth ? `${maxWidth}px` : undefined,
            }}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
        >
            <div 
                className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-white"
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#B8956A transparent',
                }}
            >
                {/* Header label */}
                <div className="flex items-center justify-between mb-4 sm:mb-5 pb-2.5 border-b border-[#EFE7DC]">
                    <div className="flex items-center gap-2">
                        <AlankaJewelleryMark className="w-3.5 h-3.5 text-brand-champagne" />
                        <h3 className="text-brand-plum text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.25em]">
                            Curated Gift Collections
                        </h3>
                    </div>
                    <span className="text-[10px] text-[#8C827A] tracking-wider uppercase hidden sm:inline">
                        Complimentary Gift Packaging
                    </span>
                </div>

                {/* 3 Gift Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                    {giftOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <Link
                                key={option.id}
                                to={option.path}
                                onClick={resetMenu}
                                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-white border border-brand-border hover:border-brand-champagne/70 shadow-sm hover:shadow-[0_12px_28px_rgba(184,149,106,0.12)] transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <div>
                                    {/* Icon badge */}
                                    <div className="w-10 h-10 rounded-full bg-[#FAF5ED] group-hover:bg-brand-champagne/10 border border-[#EFE7DC] group-hover:border-brand-champagne/30 flex items-center justify-center mb-3 sm:mb-3.5 transition-colors">
                                        <IconComponent className="w-4 h-4 text-brand-champagne transition-transform duration-300 group-hover:scale-110" />
                                    </div>

                                    {/* Title */}
                                    <h4 className="font-serif font-bold text-[14px] sm:text-[14.5px] text-brand-espresso tracking-wider uppercase group-hover:text-brand-champagne transition-colors mb-1.5">
                                        {option.title}
                                    </h4>

                                    {/* Subtitle */}
                                    <p className="text-[11.5px] text-[#6B655F] leading-snug">
                                        {option.subtitle}
                                    </p>
                                </div>

                                {/* Bottom action */}
                                <div className="mt-4 pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-[11px] font-semibold text-[#8C827A] group-hover:text-brand-champagne transition-colors">
                                    <span className="tracking-wide">Explore Gifts</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-brand-champagne transform transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GiftingMegaMenu;
