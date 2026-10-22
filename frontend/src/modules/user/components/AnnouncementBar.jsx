import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headset, Tag, Gift, Star, Bell, Zap, Shield } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

const iconMap = {
    'Truck': Truck,
    'Shield': Shield,
    'ShieldCheck': ShieldCheck,
    'RefreshCw': RefreshCw,
    'Headset': Headset,
    'Tag': Tag,
    'Gift': Gift,
    'Star': Star,
    'Bell': Bell,
    'Zap': Zap
};

const AnnouncementBar = () => {
    const { settings } = useSettings();
    const defaults = [
        { icon: 'RefreshCw', text: "Easy Returns & Refunds" },
        { icon: 'Headset', text: "Dedicated Support Team" },
        { icon: 'Truck', text: "Free Shipping" },
        { icon: 'Shield', text: "Secure Payments" }
    ];
    const announcements = settings?.announcementItems?.length ? settings.announcementItems : defaults;

    return (
        <div className="bg-brand-plum text-brand-white border-b border-brand-champagne/25 overflow-hidden py-1 relative z-[60]">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 md:gap-12 pr-6 md:pr-12">
                        {announcements.map((item, idx) => {
                            return (
                                <div key={idx} className="flex items-center gap-1.5">
                                    {item.type === 'image' && item.image ? (
                                        <img src={item.image} alt="" className="w-4 h-4 object-contain" />
                                    ) : (
                                        (() => {
                                            const IconComponent = iconMap[item.icon] || Tag;
                                            return <IconComponent className="w-3.5 h-3.5 text-brand-champagne-light" />;
                                        })()
                                    )}
                                    <span className="text-[10px] font-medium uppercase tracking-widest text-brand-white/90">{item.text}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-10%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                    display: flex;
                    width: max-content;
                }
            `}
            </style>
        </div>
    );
};

export default AnnouncementBar;
