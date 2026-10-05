/**
 * Centralized Collection Theme Configuration
 * Supports dynamic collection themes: Gold (Golden/Champagne), Silver (Sterling Slate),
 * Diamond (Dark Blue/Navy), and Gems (Emerald Green).
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
    darkAccent: '#332827',
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
    // Toggle Pill & Indicator Styling - Feminine Luxury Palette
    pillBackground: 'linear-gradient(135deg, #6B3F46 0%, #8E5B63 50%, #C98F96 100%)',
    pillShadow: '0 4px 16px rgba(107, 63, 70, 0.35)',
    activeText: 'text-white font-bold',
    containerBorder: 'rgba(217, 184, 182, 0.75)',
    containerGlow: '0 2px 14px rgba(201, 143, 150, 0.20)',
    // Atmospheric & Accent Tokens
    primaryColor: '#C98F96',
    secondaryColor: '#D9B8B6',
    darkAccent: '#6B3F46',
    badgeBg: 'bg-[#F1DFDE]/80 text-[#6B3F46] border-[#D9B8B6]',
    ribbonBg: 'bg-gradient-to-r from-[#6B3F46] to-[#8E5B63] text-[#F1DFDE]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(201,143,150,0.14), transparent 70%)',
    surfaceBg: 'bg-[#FBF8F7]',
    borderSoft: 'border-[#E9DEDA]',
    actionBtn: 'bg-[#6B3F46] text-white hover:bg-[#8E5B63]',
    linkAccent: 'text-[#6B3F46] hover:text-[#C98F96]',
    iconColor: '#C98F96',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    path: '/diamond-collection',
    // Toggle Pill & Indicator Styling
    pillBackground: 'linear-gradient(135deg, #0B192C 0%, #173153 50%, #1E3A5F 100%)',
    pillShadow: '0 4px 16px rgba(11, 25, 44, 0.40)',
    activeText: 'text-white font-bold',
    containerBorder: 'rgba(148, 163, 184, 0.6)',
    containerGlow: '0 2px 14px rgba(15, 32, 56, 0.16)',
    // Atmospheric & Accent Tokens
    primaryColor: '#0F2038',
    secondaryColor: '#1E3A5F',
    darkAccent: '#0B192C',
    badgeBg: 'bg-[#0F2038]/10 text-[#0F2038] border-[#1E3A5F]/25',
    ribbonBg: 'bg-[#0F2038] text-[#E0EAFC]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(30,58,95,0.16), transparent 70%)',
    surfaceBg: 'bg-[#F2F6FA]',
    borderSoft: 'border-[#D4E0ED]',
    actionBtn: 'bg-[#0F2038] text-white hover:bg-[#1E3A5F]',
    linkAccent: 'text-[#1E3A5F] hover:text-[#0F2038]',
    iconColor: '#1E3A5F',
  },
  gems: {
    id: 'gems',
    name: 'Gems',
    path: '/gems-collection',
    // Toggle Pill & Indicator Styling
    pillBackground: 'linear-gradient(135deg, #08291F 0%, #0D3B2E 50%, #185A44 100%)',
    pillShadow: '0 4px 16px rgba(13, 59, 46, 0.38)',
    activeText: 'text-white font-bold',
    containerBorder: 'rgba(167, 209, 194, 0.65)',
    containerGlow: '0 2px 14px rgba(13, 59, 46, 0.15)',
    // Atmospheric & Accent Tokens
    primaryColor: '#0D3B2E',
    secondaryColor: '#185A44',
    darkAccent: '#08291F',
    badgeBg: 'bg-[#0D3B2E]/10 text-[#0D3B2E] border-[#185A44]/25',
    ribbonBg: 'bg-[#0D3B2E] text-[#E3F5EC]',
    ambientGlow: 'radial-gradient(ellipse at 50% 0%, rgba(24,90,68,0.16), transparent 70%)',
    surfaceBg: 'bg-[#F0F7F4]',
    borderSoft: 'border-[#C8DFD5]',
    actionBtn: 'bg-[#0D3B2E] text-white hover:bg-[#185A44]',
    linkAccent: 'text-[#185A44] hover:text-[#0D3B2E]',
    iconColor: '#185A44',
  },
};

export const getCollectionTheme = (metal = 'gold') => {
  const key = String(metal || '').trim().toLowerCase();
  return COLLECTION_THEMES[key] || COLLECTION_THEMES.gold;
};
