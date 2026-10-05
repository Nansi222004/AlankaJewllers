import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const OFFICIAL_SETTINGS_DEFAULTS = {
  storeName: 'Alanka Jewellers',
  tagline: 'Alanka Jewellers – Where Luxury Meets Identity',
  phone: '+91 8668821446',
  contactPhone: '+91 8668821446',
  email: 'alanka.jewellers@gmail.com',
  contactEmail: 'alanka.jewellers@gmail.com',
  website: 'https://alanka-jewellers.com/',
  address: 'Alanka Jewellers, Sarafa Lane Gandhi Chowk Wani, 445304, Dist - Yavatmal, Maharashtra',
  logo: '/logo.webp',
  footerTagline: 'Timeless Elegance,',
  footerSubTagline: 'Handcrafted for You.',
  footerDescription:
    "Every piece at Alanka Jewellers tells a story of heritage and modern grace. Join our community of jewellery lovers and celebrate life's most precious moments.",
  footerCopyrightText: 'Alanka Jewellers. All Rights Reserved.',
  footerDeliveryText: 'Safe & Insured Express Worldwide Delivery',
  socialLinks: {
    facebook: '#',
    twitter: '#',
    instagram: '#',
    youtube: '#',
  },
};

export const sanitizeSettings = (raw) => {
  if (!raw || typeof raw !== 'object') return {};
  const cleaned = { ...raw };

  // Normalize legacy storeName
  if (!cleaned.storeName || /swarna\s*sparsh|alankar/i.test(cleaned.storeName)) {
    cleaned.storeName = OFFICIAL_SETTINGS_DEFAULTS.storeName;
  }

  // Normalize legacy tagline
  if (!cleaned.tagline || /swarna\s*sparsh|alankar/i.test(cleaned.tagline)) {
    cleaned.tagline = OFFICIAL_SETTINGS_DEFAULTS.tagline;
  }

  // Normalize legacy address
  if (cleaned.address && /swarna\s*sparsh|alankar/i.test(cleaned.address)) {
    cleaned.address = cleaned.address.replace(/swarna\s*sparsh|alankar\s*jewellers/gi, 'Alanka Jewellers');
  }

  // Normalize legacy fraud warning
  if (cleaned.fraudWarning && /swarna\s*sparsh|alankar/i.test(cleaned.fraudWarning)) {
    cleaned.fraudWarning = cleaned.fraudWarning.replace(/swarna\s*sparsh|alankar\s*jewellers/gi, 'Alanka Jewellers');
  }

  // Normalize legacy footer description
  if (cleaned.footerDescription && /swarna\s*sparsh|alankar/i.test(cleaned.footerDescription)) {
    cleaned.footerDescription = cleaned.footerDescription.replace(/swarna\s*sparsh|alankar\s*jewellers/gi, 'Alanka Jewellers');
  }

  // Normalize legacy footer copyright text
  if (cleaned.footerCopyrightText && /swarna\s*sparsh|alankar/i.test(cleaned.footerCopyrightText)) {
    cleaned.footerCopyrightText = cleaned.footerCopyrightText.replace(/swarna\s*sparsh|alankar\s*jewellers/gi, 'Alanka Jewellers');
  }

  // Normalize logo if pointing to legacy swarna/sands assets
  if (cleaned.logo && /swarna|sands-logo|alankar/i.test(cleaned.logo)) {
    cleaned.logo = OFFICIAL_SETTINGS_DEFAULTS.logo;
  }

  return cleaned;
};

const SettingsContext = createContext({
  settings: OFFICIAL_SETTINGS_DEFAULTS,
  loading: false,
  refreshSettings: async () => { },
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('siteSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = sanitizeSettings(parsed);
        return {
          ...OFFICIAL_SETTINGS_DEFAULTS,
          ...cleaned,
          socialLinks: {
            ...OFFICIAL_SETTINGS_DEFAULTS.socialLinks,
            ...(cleaned.socialLinks || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return OFFICIAL_SETTINGS_DEFAULTS;
  });

  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('public/settings');
      if (res.data?.success && res.data?.data?.settings) {
        const fetched = sanitizeSettings(res.data.data.settings);
        setSettings((prev) => {
          const merged = {
            ...OFFICIAL_SETTINGS_DEFAULTS,
            ...prev,
            ...fetched,
            socialLinks: {
              ...OFFICIAL_SETTINGS_DEFAULTS.socialLinks,
              ...(prev.socialLinks || {}),
              ...(fetched.socialLinks || {}),
            },
          };
          try {
            localStorage.setItem('siteSettings', JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch public settings, using fallback/stored settings:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('siteSettings');
        if (saved) {
          const parsed = JSON.parse(saved);
          const cleaned = sanitizeSettings(parsed);
          setSettings((prev) => ({
            ...OFFICIAL_SETTINGS_DEFAULTS,
            ...prev,
            ...cleaned,
            socialLinks: {
              ...OFFICIAL_SETTINGS_DEFAULTS.socialLinks,
              ...(prev.socialLinks || {}),
              ...(cleaned.socialLinks || {}),
            },
          }));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
