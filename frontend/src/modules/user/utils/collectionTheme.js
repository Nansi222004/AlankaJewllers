/**
 * Centralized Collection Theme Configuration
 * A unified rose-luxury system with restrained material-specific accents.
 */

export const COLLECTION_THEMES = {
  gold: {
    id: 'gold',
    name: 'Gold',
    path: '/gold-collection',
    // Toggle Pill & Indicator Styling
    pillBackground: 'linear-gradient(135deg, #B8956A 0%, #D8C3A5 100%)',
    pillShadow: '0 4px 14px rgba(184, 149, 106, 0.32)',
    activeText: 'text-brand-espresso font-extrabold',
    containerBorder: 'rgba(216, 195, 165, 0.65)',
    containerGlow: '0 2px 14px rgba(184, 149, 106, 0.14)',
    // Atmospheric & Accent Tokens
    primaryColor: '#B8956A',
    secondaryColor: '#D8C3A5',
    darkAccent: '#702F46',
    badgeBg: 'bg-brand-champagne/15 text-brand-espresso border-brand-champagne/30',
    ribbonBg: 'bg-brand-plum text-brand-champagne-light',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(184,149,106,0.12), transparent 70%)',
    surfaceBg: 'bg-brand-pearl',
    borderSoft: 'border-brand-border-soft',
    actionBtn: 'bg-brand-champagne text-brand-espresso hover:bg-brand-champagne-light',
    linkAccent: 'text-brand-champagne hover:text-brand-espresso',
    iconColor: '#B8956A',
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    path: '/silver-collection',
    // Polished silver: cool platinum with enough depth to remain visible on white.
    pillBackground: 'linear-gradient(135deg, #8B98A5 0%, #C6CED6 52%, #EEF1F4 100%)',
    pillShadow: '0 4px 16px rgba(105, 119, 133, 0.28)',
    activeText: 'text-[#303841] font-extrabold',
    containerBorder: 'rgba(166, 178, 190, 0.68)',
    containerGlow: '0 2px 14px rgba(120, 135, 150, 0.18)',
    // Atmospheric & Accent Tokens
    primaryColor: '#C77F94',
    secondaryColor: '#E1B5C2',
    darkAccent: '#702F46',
    badgeBg: 'bg-[#F7DDE5]/80 text-[#702F46] border-[#E1B5C2]',
    ribbonBg: 'bg-gradient-to-r from-[#702F46] to-[#9F536B] text-[#FCEFF2]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(201,143,150,0.14), transparent 70%)',
    surfaceBg: 'bg-[#FFF9FA]',
    borderSoft: 'border-[#EBD3DA]',
    actionBtn: 'bg-[#702F46] text-white hover:bg-[#9F536B]',
    linkAccent: 'text-[#702F46] hover:text-[#C77F94]',
    iconColor: '#C77F94',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    path: '/diamond-collection',
    // Icy diamond blue: crisp, luminous and clearly distinct from silver.
    pillBackground: 'linear-gradient(135deg, #39779B 0%, #6EA9C7 52%, #B9DCEB 100%)',
    pillShadow: '0 4px 16px rgba(57, 119, 155, 0.30)',
    activeText: 'text-white font-bold',
    containerBorder: 'rgba(110, 169, 199, 0.58)',
    containerGlow: '0 2px 14px rgba(57, 119, 155, 0.17)',
    // Atmospheric & Accent Tokens
    primaryColor: '#5C3B55',
    secondaryColor: '#9B718F',
    darkAccent: '#41283C',
    badgeBg: 'bg-[#F4EAF1] text-[#5C3B55] border-[#DCC5D5]',
    ribbonBg: 'bg-[#5C3B55] text-[#FFF7FC]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(155,113,143,0.16), transparent 70%)',
    surfaceBg: 'bg-[#FCF8FB]',
    borderSoft: 'border-[#E8D9E3]',
    actionBtn: 'bg-[#5C3B55] text-white hover:bg-[#805E7A]',
    linkAccent: 'text-[#805E7A] hover:text-[#5C3B55]',
    iconColor: '#805E7A',
  },
  gems: {
    id: 'gems',
    name: 'Gems',
    path: '/gems-collection',
    // Rich emerald tones echo the precious gemstones used across this collection.
    pillBackground: 'linear-gradient(135deg, #145C4A 0%, #27816A 52%, #66AD91 100%)',
    pillShadow: '0 4px 16px rgba(20, 92, 74, 0.30)',
    activeText: 'text-white font-bold',
    containerBorder: 'rgba(66, 139, 113, 0.58)',
    containerGlow: '0 2px 14px rgba(20, 92, 74, 0.17)',
    // Atmospheric & Accent Tokens
    primaryColor: '#702F46',
    secondaryColor: '#C86B85',
    darkAccent: '#552237',
    badgeBg: 'bg-[#FCEFF2] text-[#702F46] border-[#E8BFCC]',
    ribbonBg: 'bg-[#702F46] text-[#FFF4F7]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(200,107,133,0.16), transparent 70%)',
    surfaceBg: 'bg-[#FFF7F9]',
    borderSoft: 'border-[#EBD3DA]',
    actionBtn: 'bg-[#702F46] text-white hover:bg-[#9C3F60]',
    linkAccent: 'text-[#9C3F60] hover:text-[#702F46]',
    iconColor: '#C86B85',
  },
};

export const getCollectionTheme = (metal = 'gold') => {
  const key = String(metal || '').trim().toLowerCase();
  return COLLECTION_THEMES[key] || COLLECTION_THEMES.gold;
};
