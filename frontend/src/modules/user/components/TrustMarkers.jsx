import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';

const parseMarkerText = (text, defaultBold, defaultNormal) => {
    if (!text) return { bold: defaultBold, normal: defaultNormal };
    const parts = text.trim().split(/\s+/);
    if (parts.length <= 1) {
        return { bold: text, normal: '' };
    }
    const normal = parts[parts.length - 1];
    const bold = parts.slice(0, -1).join(' ');
    return { bold, normal };
};

const TrustMarkers = () => {
    const [settings, setSettings] = useState({
        purityText: '925 Fine Silver',
        warrantyText: '6-Month Warranty',
        safetyText: 'Skin Safe Jewellery',
        platingText: 'Lifetime Plating',
        returnPolicy: 'Easy Returns'
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await api.get('public/settings');
                if (res.data.success && res.data.data?.settings) {
                    setSettings(res.data.data.settings);
                    return;
                }
            } catch (err) {
                console.warn("Failed to fetch public settings from API, falling back to localStorage/defaults:", err.message);
            }

            const saved = localStorage.getItem('siteSettings');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse siteSettings from localStorage", e);
                }
            }
        };

        loadSettings();
        window.addEventListener('storage', loadSettings);
        return () => window.removeEventListener('storage', loadSettings);
    }, []);

    const purity = parseMarkerText(settings.purityText, '925', 'Fine Silver');
    const warranty = parseMarkerText(settings.warrantyText, '6-Month', 'Warranty');
    const safety = parseMarkerText(settings.safetyText, 'Skin Safe', 'Jewellery');
    const plating = parseMarkerText(settings.platingText, 'Lifetime', 'Plating');
    const returns = parseMarkerText(settings.returnPolicy, 'Easy', 'Returns');

    const markers = [
        { id: 1, bold: purity.bold, normal: purity.normal },
        { id: 2, bold: warranty.bold, normal: warranty.normal },
        { id: 3, bold: safety.bold, normal: safety.normal },
        { id: 4, bold: plating.bold, normal: plating.normal },
        { id: 5, bold: returns.bold, normal: returns.normal }
    ];

    return (
        <section className="w-full bg-[#EDE1E5] py-4 md:py-5 border-b border-[#D2BBC3]">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-10 md:gap-y-2.5">
                    {markers.map((marker, index) => (
                        <motion.div
                            key={marker.id}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="group flex min-w-0 cursor-default items-center gap-2 rounded-xl border border-brand-border-soft bg-white p-2.5 shadow-sm md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none"
                        >
                            <span className="w-1.5 h-1.5 rotate-45 bg-brand-champagne shrink-0 opacity-80 group-hover:scale-125 transition-transform" />
                            <span className="text-brand-espresso text-[11px] sm:text-xs md:text-[13px] font-sans tracking-wide">
                                <strong className="font-semibold text-brand-espresso">{marker.bold}</strong>{" "}
                                <span className="font-light text-stone-600">{marker.normal}</span>
                            </span>
                            {index < markers.length - 1 && (
                                <div className="hidden lg:block w-px h-3 bg-brand-border ml-6" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustMarkers;
