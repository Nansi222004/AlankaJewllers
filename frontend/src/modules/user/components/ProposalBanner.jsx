import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { useHomepageCms } from '../hooks/useHomepageCms';
import bannerImgDefault from '@assets/proposal_banner_premium.png';
import { resolveLegacyCmsAsset } from '../utils/legacyCmsAssets';
import { ensureSilverHomePath } from '../utils/silverHomePaths';

const ProposalBanner = () => {
    const { categories } = useShop();
    const { data: homepageSections = {} } = useHomepageCms();
    const sectionData = homepageSections?.['proposal-rings'];

    if (sectionData?.isActive === false) return null;

    const configuredItems = Array.isArray(sectionData?.items) ? sectionData.items : [];
    const normalizedConfiguredItems = configuredItems
        .map((item, index) => {
            const category = item.categoryId
                ? categories.find(c => String(c._id || c.id) === String(item.categoryId))
                : null;
            if (!category) {
                if (!item.path) return null;
                return {
                    ...item,
                    id: item.itemId || item._id || item.id || `legacy-${index}`,
                    name: item.name || item.label || 'Proposal Rings',
                    image: resolveLegacyCmsAsset(item.image, bannerImgDefault),
                    path: ensureSilverHomePath(item.path)
                };
            }
            return {
                ...item,
                id: item.itemId || item._id || item.id || `${category._id || category.id}-${index}`,
                name: item.name || item.label || category.name || 'Proposal Rings',
                image: resolveLegacyCmsAsset(item.image, bannerImgDefault),
                path: ensureSilverHomePath(`/shop?category=${category._id || category.id}`)
            };
        })
        .filter(Boolean);

    const displayItems = normalizedConfiguredItems.length > 0
        ? normalizedConfiguredItems
        : [{ id: 'proposal-fallback', name: 'Proposal Rings', image: bannerImgDefault, path: ensureSilverHomePath('/shop') }];

    // Use first item for banner if available
    const bannerItem = displayItems[0];
    const bannerImage = bannerItem?.image || bannerImgDefault;
    const bannerLink = bannerItem?.path || '/shop';

    return (
        <section className="w-full bg-brand-plum border-y border-brand-champagne/20 relative overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-plum via-brand-plum to-brand-plum opacity-95"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between py-8 md:py-16 gap-8">

                    {/* Visual Section - Left Side */}
                    <div className="w-full md:w-1/2 relative group md:pt-10">
                        <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-brand-champagne/30">
                            <img
                                src={bannerImage}
                                alt="Proposal Ring"
                                className="w-full h-[250px] md:h-[450px] object-cover hover:scale-105 transition-transform duration-1000"
                            />
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-plum/60 to-transparent pointer-events-none"></div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -z-10 top-0 -left-12 w-64 h-64 bg-brand-champagne opacity-15 blur-[100px] rounded-full"></div>
                    </div>

                    {/* Content Section - Right Side */}
                    <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
                        <div className="inline-block px-4 py-1.5 bg-brand-champagne/10 border border-brand-champagne/40 rounded-full mb-2 backdrop-blur-sm">
                            <span className="text-brand-champagne-light text-xs md:text-sm font-serif tracking-[0.3em] uppercase">The Diamond Story</span>
                        </div>

                        <h2 className="font-display text-4xl md:text-7xl text-white leading-[1.1] tracking-tight">
                            {sectionData?.label || "Discover Your Unique Story in Diamonds"}
                            <span className="block italic font-serif font-light text-brand-champagne-light text-3xl md:text-5xl mt-2">Timeless Elegance</span>
                        </h2>

                        <p className="text-gray-300 font-serif text-lg md:text-xl max-w-lg mx-auto md:mx-0 leading-relaxed italic">
                            Timeless pieces for your most memorable moments. Every love story deserves a perfect beginning.
                        </p>

                        <div className="pt-4">
                            <Link
                                to={bannerLink}
                                className="inline-flex items-center gap-3 bg-brand-champagne text-brand-espresso px-8 py-4 rounded-full font-bold hover:bg-[#D4AF37] transition-all transform hover:-translate-y-1 shadow-[0_10px_20px_rgba(0,0,0,0.4)] group"
                            >
                                <span className="tracking-wide">Explore Collection</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ProposalBanner;

