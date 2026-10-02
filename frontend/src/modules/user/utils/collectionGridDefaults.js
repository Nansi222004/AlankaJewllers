import goldRingsLight from '@assets/categories/gold_rings_light.png';
import goldEarringsLight from '@assets/categories/gold_earrings_light.png';
import goldPendantsLight from '@assets/categories/gold_pendants_light.png';
import goldBracelet from '@assets/categories/gold_bracelet.png';
import goldBangle from '@assets/categories/gold_bangle.png';
import goldMangalsutraLight from '@assets/categories/gold_mangalsutra_light.png';
import setsImg from '@assets/categories/sets.png';
import newlaunchImg from '@assets/categories/newlaunch.png';

import ringsImg from '@assets/categories/rings.png';
import earringsImg from '@assets/categories/earrings.png';
import silverchainsImg from '@assets/categories/silverchains.png';
import ankletsImg from '@assets/categories/anklets.png';
import braceletsImg from '@assets/categories/bracelets.png';
import pendantsImg from '@assets/categories/pendants.png';
import bangleImg from '@assets/categories/bangle.png';
import mensilverImg from '@assets/categories/mensilver.png';

import diamondRingImg from '@assets/diamond_ring.png';
import catWeddingDiamondImg from '@assets/cat_wedding_diamond.png';
import catWeddingChokerImg from '@assets/cat_wedding_choker.png';
import catWeddingMangalsutraImg from '@assets/cat_wedding_mangalsutra.png';
import catWeddingBanglesImg from '@assets/cat_wedding_bangles.png';
import eternalDiamondBrillianceImg from '@assets/hero/eternal_diamond_brilliance.png';
import diamondEleganceCampaignImg from '@assets/hero/diamond_elegance_campaign.png';
import diamondLuxuryImg from '@assets/hero/diamond_luxury.png';
import gemsHeroImg from '@assets/hero/precious_gemstones_art_of_colour.jpg';

export const goldCollectionGridDefaults = [
    {
        id: 'gold-rings',
        name: 'Gold Rings',
        label: 'Gold Rings',
        image: goldRingsLight,
        path: '/shop?metal=gold&category=finger-ring',
        badge: 'Signature'
    },
    {
        id: 'gold-earrings',
        name: 'Gold Earrings',
        label: 'Gold Earrings',
        image: goldEarringsLight,
        path: '/shop?metal=gold&category=earrings'
    },
    {
        id: 'gold-necklaces',
        name: 'Gold Necklaces',
        label: 'Gold Necklaces',
        image: setsImg,
        path: '/shop?metal=gold&category=necklace'
    },
    {
        id: 'gold-bangles',
        name: 'Gold Bangles',
        label: 'Gold Bangles',
        image: goldBangle,
        path: '/shop?metal=gold&category=bangles'
    },
    {
        id: 'gold-bracelets',
        name: 'Gold Bracelets',
        label: 'Gold Bracelets',
        image: goldBracelet,
        path: '/shop?metal=gold&category=bracelet'
    },
    {
        id: 'gold-pendants',
        name: 'Gold Pendants',
        label: 'Gold Pendants',
        image: goldPendantsLight,
        path: '/shop?metal=gold&category=chain-pendent'
    },
    {
        id: 'gold-mangalsutra',
        name: 'Gold Mangalsutra',
        label: 'Gold Mangalsutra',
        image: goldMangalsutraLight,
        path: '/shop?metal=gold&category=mangalsutra'
    },
    {
        id: 'gold-new-arrivals',
        name: 'Gold New Arrivals',
        label: 'Gold New Arrivals',
        image: newlaunchImg,
        path: '/shop?metal=gold&sort=latest',
        badge: 'Fresh Drops'
    }
];

export const silverCollectionGridDefaults = [
    {
        id: 'silver-rings',
        name: 'Silver Rings',
        label: 'Silver Rings',
        image: ringsImg,
        path: '/shop?metal=silver&category=finger-ring',
        badge: 'Sterling 925'
    },
    {
        id: 'silver-earrings',
        name: 'Silver Earrings',
        label: 'Silver Earrings',
        image: earringsImg,
        path: '/shop?metal=silver&category=earrings'
    },
    {
        id: 'silver-chains',
        name: 'Silver Chains',
        label: 'Silver Chains',
        image: silverchainsImg,
        path: '/shop?metal=silver&category=mens-chain'
    },
    {
        id: 'silver-anklets',
        name: 'Silver Anklets',
        label: 'Silver Anklets',
        image: ankletsImg,
        path: '/shop?metal=silver&category=anklets'
    },
    {
        id: 'silver-bracelets',
        name: 'Silver Bracelets',
        label: 'Silver Bracelets',
        image: braceletsImg,
        path: '/shop?metal=silver&category=bracelet'
    },
    {
        id: 'silver-pendants',
        name: 'Silver Pendants',
        label: 'Silver Pendants',
        image: pendantsImg,
        path: '/shop?metal=silver&category=chain-pendent'
    },
    {
        id: 'silver-bangles',
        name: 'Silver Bangles',
        label: 'Silver Bangles',
        image: bangleImg,
        path: '/shop?metal=silver&category=bangles'
    },
    {
        id: 'men-in-silver',
        name: 'Men in Silver',
        label: 'Men in Silver',
        image: mensilverImg,
        path: '/shop?metal=silver&category=mens-jewellery',
        badge: 'Refined'
    }
];

export const diamondCollectionGridDefaults = [
    {
        id: 'diamond-rings',
        name: 'Diamond Rings',
        label: 'Diamond Rings',
        image: diamondRingImg,
        path: '/shop?metal=diamond&category=finger-ring',
        badge: 'Solitaires'
    },
    {
        id: 'diamond-earrings',
        name: 'Diamond Earrings',
        label: 'Diamond Earrings',
        image: catWeddingDiamondImg,
        path: '/shop?metal=diamond&category=earrings'
    },
    {
        id: 'diamond-necklaces',
        name: 'Diamond Necklaces',
        label: 'Diamond Necklaces',
        image: catWeddingChokerImg,
        path: '/shop?metal=diamond&category=necklace'
    },
    {
        id: 'diamond-pendants',
        name: 'Diamond Pendants',
        label: 'Diamond Pendants',
        image: catWeddingMangalsutraImg,
        path: '/shop?metal=diamond&category=chain-pendent'
    },
    {
        id: 'diamond-bangles',
        name: 'Diamond Bangles',
        label: 'Diamond Bangles',
        image: catWeddingBanglesImg,
        path: '/shop?metal=diamond&category=bangles'
    }
];

// Fallback discovery cards mirror the CMS category-grid contract. Admin CMS
// items replace these automatically once a Gems Collection Grid is configured.
export const gemsCollectionGridDefaults = [
    {
        id: 'gems-all',
        name: 'Gemstone Jewellery',
        label: 'Gemstone Jewellery',
        image: gemsHeroImg,
        path: '/shop?metal=gems',
        badge: 'The Gems Edit'
    },
    {
        id: 'gems-rings',
        name: 'Gemstone Rings',
        label: 'Gemstone Rings',
        image: ringsImg,
        path: '/shop?metal=gems&category=finger-ring'
    },
    {
        id: 'gems-earrings',
        name: 'Gemstone Earrings',
        label: 'Gemstone Earrings',
        image: earringsImg,
        path: '/shop?metal=gems&category=earrings'
    },
    {
        id: 'gems-pendants',
        name: 'Gemstone Pendants',
        label: 'Gemstone Pendants',
        image: pendantsImg,
        path: '/shop?metal=gems&category=chain-pendent'
    },
    {
        id: 'gems-bracelets',
        name: 'Gemstone Bracelets',
        label: 'Gemstone Bracelets',
        image: braceletsImg,
        path: '/shop?metal=gems&category=bracelet'
    },
    {
        id: 'gems-necklaces',
        name: 'Gemstone Necklaces',
        label: 'Gemstone Necklaces',
        image: setsImg,
        path: '/shop?metal=gems&category=necklace'
    }
];
