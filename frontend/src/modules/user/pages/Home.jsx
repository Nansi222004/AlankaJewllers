import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import { useHomepageCms } from '../hooks/useHomepageCms';
import { useResetScroll } from '../../../hooks/useResetScroll';
import LazySection from '../../../components/LazySection';

// ─── ABOVE-FOLD: eagerly imported — these are visible immediately on page load ───
import PromoSlider from '../components/PromoSlider';
import NewLaunchSection from '../components/NewLaunchSection';
import CollectionNewLaunch from '../components/CollectionNewLaunch';
import CategoryGrid, {
    SilverCollectionGrid
} from '../components/CategoryGrid';
import DynamicPromoBanner from '../components/DynamicPromoBanner';
import TrustMarkers from '../components/TrustMarkers';
import GoldSilverRates from '../components/GoldSilverRates';

// ─── BELOW-FOLD: lazy loaded — downloaded only when user scrolls toward them ────
// This moves ~70KB of JS out of the critical render path
import ShopByPrice from '../components/ShopByPrice';
import PremiumCategoryCards from '../components/PremiumCategoryCards';
import BestStylesSection from '../components/BestStylesSection';
import AutoBannerSection from '../components/AutoBannerSection';
import PerfectGift from '../components/PerfectGift';
import StyleItYourWay from '../components/StyleItYourWay';
import OccasionalSpecial from '../components/OccasionalSpecial';
import AllJewellery from '../components/AllJewellery';
import SilverCollectionSection from '../components/SilverCollectionSection';
import SilverCuratedShowcase from '../components/SilverCuratedShowcase';
import ProposalBanner from '../components/ProposalBanner';
import Testimonials from '../components/Testimonials';
import BrandPromises from '../components/BrandPromises';
import ChitChatSection from '../components/ChitChatSection';
import Newsletter from '../components/Newsletter';

// Lightweight fallback for lazy sections — invisible so layout doesn't shift


// Wrap off-screen sections in LazySection with 500px rootMargin to load only when scrolling close


const Home = () => {
    const location = useLocation();
    const isSilverCollection = location.pathname === '/silver-collection';
    const { updateActiveMetal } = useShop();
    const {
        isError: isHomepageCmsError,
        error: homepageCmsError,
        refetch: refetchHomepageCms,
    } = useHomepageCms();

    useResetScroll();

    useEffect(() => {
        document.title = "Alankar Jewellers | Crafted for Moments That Last";
        updateActiveMetal('silver');
    }, [updateActiveMetal]);

    return (
        <div data-collection-theme="silver" className="bg-[#E9DDE1] font-body text-[#3D2730] relative selection:bg-[#DBC8CE] selection:text-[#6B3F46]">
            {isHomepageCmsError && (
                <div className="mx-auto max-w-[1450px] px-4 pt-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <span className="font-bold">Homepage content is using fallback data.</span>{' '}
                            <span className="opacity-80">
                                {homepageCmsError?.response?.data?.message || homepageCmsError?.message || ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => refetchHomepageCms()}
                            className="shrink-0 rounded-lg bg-[#702F46] px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white hover:opacity-95"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* ── ABOVE FOLD: loaded eagerly (visible immediately) ── */}
            <PromoSlider />
            <CategoryGrid />
            <NewLaunchSection />
            <SilverCollectionGrid />
            {isSilverCollection && <CollectionNewLaunch metal="silver" />}
            <DynamicPromoBanner />
            <TrustMarkers />
            <GoldSilverRates metal="silver" />

            {/* ── BELOW FOLD: lazy loaded inside SectionShell ── */}
            <ShopByPrice />
            <PremiumCategoryCards />
            <BestStylesSection />
            <AutoBannerSection />
            <PerfectGift />
            <StyleItYourWay />
            <OccasionalSpecial />
            <AllJewellery />
            <SilverCollectionSection />
            <SilverCuratedShowcase />
            <ProposalBanner />
            <Testimonials />
            <BrandPromises />
            <ChitChatSection />
            <Newsletter />
        </div>
    );
};

export default Home;
