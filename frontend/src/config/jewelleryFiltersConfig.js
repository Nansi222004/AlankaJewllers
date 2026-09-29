import whiteImg from '@assets/gold_color_white.png';
import roseImg from '@assets/gold_color_rose.png';
import yellowImg from '@assets/gold_color_yellow.png';

/**
 * Data-driven configuration for Jewellery Type and nested secondary filters.
 * Only types/purities/origins verified in the project's actual catalog,
 * customer navigation, CMS sections, or official settings are included.
 */

export const GOLD_TONE_OPTIONS = [
  { label: 'All Gold Tones', value: 'all', image: null, swatchColor: '#C59B27' },
  { label: 'Yellow Gold', value: 'gold', image: yellowImg, swatchColor: '#EAB308' },
  { label: 'Rose Gold', value: 'rose-gold', image: roseImg, swatchColor: '#FB7185' },
  { label: 'White Gold', value: 'white-gold', image: whiteImg, swatchColor: '#94A3B8' }
];

export const SILVER_TYPE_OPTIONS = [
  { label: 'All Silver', value: 'all', swatchColor: '#94A3B8' },
  { label: '925 Silver', value: '925', swatchColor: '#CBD5E1' },
  { label: 'Fine Silver', value: 'fine', swatchColor: '#F8FAFC' }
];

export const DIAMOND_TYPE_OPTIONS = [
  { label: 'All Diamonds', value: 'all', swatchColor: '#BAE6FD' },
  { label: 'Natural Diamond', value: 'natural', swatchColor: '#FEF08A' },
  { label: 'Lab-Grown Diamond', value: 'lab_grown', swatchColor: '#93C5FD' }
];

export const JEWELLERY_TYPE_CONFIG = {
  gold: {
    id: 'gold',
    label: 'Gold',
    panelTitle: 'GOLD COLOUR',
    paramKey: 'tone',
    options: GOLD_TONE_OPTIONS
  },
  silver: {
    id: 'silver',
    label: 'Silver',
    panelTitle: 'SILVER TYPE',
    paramKey: 'silver_type',
    options: SILVER_TYPE_OPTIONS
  },
  diamond: {
    id: 'diamond',
    label: 'Diamond',
    panelTitle: 'DIAMOND TYPE',
    paramKey: 'diamondType',
    options: DIAMOND_TYPE_OPTIONS
  }
};
