import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';

import giftWife from '@assets/gift_wife_silver.png';
import giftGF from '@assets/gift_gf_silver.png';
import giftMother from '@assets/gift_mother_silver.png';
import giftSister from '@assets/gift_sister_silver.png';

const BONDS = [
    { id: 1, label: 'Wife', image: giftWife, path: '/shop?search=wife&metal=gold' },
    { id: 2, label: 'Girlfriend', image: giftGF, path: '/shop?search=girlfriend&metal=gold' },
    { id: 3, label: 'Mother', image: giftMother, path: '/shop?search=mother&metal=gold' },
    { id: 4, label: 'Sister', image: giftSister, path: '/shop?search=sister&metal=gold' }
];

const ensureGoldCategoryPath = (rawPath, categoryId = '') => {
    const source = String(rawPath || '/shop').trim();
    const queryString = source.startsWith('/shop') && source.includes('?') ? source.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    params.set('metal', 'gold');
    const normalizedCategoryId = String(categoryId || '').trim();
    if (normalizedCategoryId) params.set('category', normalizedCategoryId);
    const query = params.toString();
    return `/shop${query ? `?${query}` : '?metal=gold'}`;
};

const CuratedForEveryBond = ({ sectionData = null }) => {
    const bonds = useMemo(() => {
        const configured = Array.isArray(sectionData?.items) ? sectionData.items : [];
        if (configured.length === 0) return BONDS;

        return configured.map((item, idx) => ({
            id: item?.itemId || item?.id || `gold-bond-${idx + 1}`,
            label: item?.name || item?.label || BONDS[idx % BONDS.length].label,
            image: resolveLegacyCmsAsset(item?.image, BONDS[idx % BONDS.length].image),
            path: ensureGoldCategoryPath(item?.path || BONDS[idx % BONDS.length].path, item?.categoryId || '')
        }));
    }, [sectionData]);

    const title = String(sectionData?.settings?.title || sectionData?.label || 'Curated For Every Bond').trim() || 'Curated For Every Bond';

    return (
        <section className="w-full bg-brand-pearl py-8 md:py-12 px-4 md:px-12 border-b border-brand-border-soft overflow-hidden select-none">
            <div className="max-w-[1000px] mx-auto">
                <div className="text-center mb-6 md:mb-10">
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne mb-1.5 block">
                        Gifts of Love
                    </span>
                    <h2 className="text-[22px] md:text-[30px] font-serif font-normal text-brand-espresso tracking-tight">
                        {title}
                    </h2>
                    <div className="h-px w-16 bg-brand-champagne/40 mx-auto mt-2.5" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {bonds.map((bond) => (
                        <Link
                            key={bond.id}
                            to={bond.path}
                            className="group block"
                        >
                            <motion.div
                                whileHover={{ y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="relative flex flex-col items-center"
                            >
                                <div className="relative w-full aspect-[5/6] overflow-hidden rounded-[20px] shadow-2xs border border-brand-border bg-brand-porcelain">
                                    <img
                                        src={bond.image}
                                        alt={bond.label}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors" />
                                </div>

                                <div className="mt-[-16px] z-10 w-[84%] bg-white py-2 px-3 rounded-full shadow-sm text-center border border-brand-border group-hover:border-brand-champagne transition-all duration-300">
                                    <span className="text-brand-plum group-hover:text-brand-espresso font-serif italic text-xs md:text-sm font-medium tracking-tight transition-colors">
                                        {bond.label}
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CuratedForEveryBond;
