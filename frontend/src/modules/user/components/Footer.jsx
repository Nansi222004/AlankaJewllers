import React, { useState, useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Truck,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShieldCheck,
  Star,
  Plus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import defaultLogo from "@/assets/logo-emblem.webp";
import { useSettings, sanitizeSettings } from "../../../context/SettingsContext";
import {
  normalizeExternalLink,
  normalizeFooterLink,
} from "../utils/navigation";
import api from "../../../services/api";

const Footer = () => {
  const location = useLocation();
  const isOrderSuccess = location.pathname === "/order-success";
  const { settings: globalSettings } = useSettings();

  const [settings, setSettings] = useState({
    storeName: "Alankar Jewellers",
    tagline: "Alankar Jewellers – Where Luxury Meets Identity",
    logo: "/logo.webp",
    footerTagline: "Timeless Elegance,",
    footerSubTagline: "Handcrafted for You.",
    footerDescription:
      "Every piece at Alankar Jewellers tells a story of heritage and modern grace. Join our community of jewellery lovers and celebrate life's most precious moments.",
    address:
      "Alankar Jewellers, Sarafa Lane Gandhi Chowk Wani, 445304, Dist - Yavatmal, Maharashtra",
    phone: "+91 8668821446",
    email: "swarna.sparsh22@gmail.com",
    footerColumn1Title: "Experience",
    footerColumn2Title: "Policies",
    footerColumn3Title: "Our World",
    footerExperienceLinks: [
      { name: "Easy Returns", path: "/returns" },
      { name: "Contact Us", path: "/contact" },
      { name: "FAQs", path: "/help" },
      { name: "Gift Cards", path: "/gift-cards" },
    ],
    footerPoliciesLinks: [
      { name: "Shipping Policy", path: "/shipping-policy" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Cancellation Policy", path: "/cancellation-policy" },
      { name: "Terms & Conditions", path: "/terms" },
    ],
    footerWorldLinks: [
      { name: "About Us", path: "/about" },
      { name: "Jewellery Care Guide", path: "/care-guide" },
      { name: "Our Craft", path: "/craft" },
    ],
    socialLinks: {
      facebook: "#",
      twitter: "#",
      instagram: "#",
    },
    footerDeliveryText: "Safe & Insured Express Worldwide Delivery",
    footerCopyrightText: "Alankar Jewellers. All Rights Reserved.",
  });

  const [openSections, setOpenSections] = useState({
    shop: false,
    help: false,
    about: false,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("public/settings");
        if (res.data.success && res.data.data?.settings) {
          const fetched = sanitizeSettings(res.data.data.settings);
          setSettings((prev) => ({
            ...prev,
            ...fetched,
            socialLinks: {
              ...prev.socialLinks,
              ...(fetched.socialLinks || {}),
            },
          }));
          return;
        }
      } catch (err) {
        console.warn(
          "Failed to fetch public footer settings, falling back to localStorage/defaults:",
          err.message,
        );
      }

      const saved = localStorage.getItem("siteSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = sanitizeSettings(parsed);
        setSettings((prev) => ({
          ...prev,
          ...cleaned,
          socialLinks: {
            ...prev.socialLinks,
            ...(cleaned.socialLinks || {}),
          },
        }));
      }
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);
    return () => window.removeEventListener("storage", loadSettings);
  }, []);

  const activeLogo =
    globalSettings?.logo &&
      !globalSettings.logo.includes("logo.webp") &&
      !/swarna|sands/i.test(globalSettings.logo)
      ? globalSettings.logo
      : defaultLogo;
  const activeStoreName =
    !globalSettings?.storeName || /swarna\s*sparsh|Alankarr/i.test(globalSettings.storeName)
      ? "Alankar Jewellers"
      : globalSettings.storeName;
  const activeTagline = globalSettings?.footerTagline || settings.footerTagline;
  const activeSubTagline =
    globalSettings?.footerSubTagline || settings.footerSubTagline;
  const activeDescription =
    globalSettings?.footerDescription || settings.footerDescription;
  const activePhone = globalSettings?.phone || settings.phone;
  const activeEmail = globalSettings?.email || settings.email;
  const activeAddress = globalSettings?.address || settings.address;

  const mobileShopLinks = [
    { name: "Shop All Jewellery", path: "/shop" },
    { name: "Gold", path: "/gold-collection" },
    { name: "Silver", path: "/silver-collection" },
    { name: "Diamond", path: "/diamond-collection" },
    { name: "Gems", path: "/gems-collection" },
    { name: "Bullions", path: "/shop?metal=gold&karat=24" },
    { name: "Gifting", path: "/category/women" },
    { name: "Jewellery Under ₹50K", path: "/shop?price_max=50000" },
    { name: "Exclusive", path: "/shop?search=exclusive" },
  ];

  const mobileHelpLinks = [
    { name: "Easy Returns", path: "/returns" },
    { name: "Shipping Policy", path: "/shipping-policy" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Cancellation Policy", path: "/cancellation-policy" },
    { name: "Terms & Conditions", path: "/terms" },
    { name: "FAQs", path: "/help" },
    { name: "Contact Us", path: "/contact" },
  ];

  const mobileAboutLinks = [
    { name: "About Us", path: "/about" },
    { name: "Jewellery Care Guide", path: "/care-guide" },
    { name: "Our Craft", path: "/craft" },
    { name: "Blogs", path: "/blogs" },
  ];

  if (isOrderSuccess) return null;

  return (
    <footer className="relative overflow-hidden border-t border-brand-champagne/30 bg-brand-plum pb-18 pt-3 text-brand-porcelain md:pb-8 md:pt-16">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-plum via-brand-champagne to-brand-plum"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* ── MOBILE / APP VIEW (< md) ── */}
        <div className="block md:hidden">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center pt-0.5 pb-2">
            <Link
              to="/"
              className="inline-block transition-transform active:scale-95 duration-300"
            >
              <img
                src={activeLogo}
                alt={activeStoreName}
                className="h-10 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = defaultLogo;
                }}
              />
            </Link>
            <h3 className="mt-1 font-serif text-[11.5px] font-bold uppercase tracking-[0.2em] text-white">
              {activeStoreName}
            </h3>
            <p className="mt-0.5 font-serif text-[10px] italic tracking-wider text-brand-champagne-light font-light">
              Where Luxury Meets Identity
            </p>
          </div>

          {/* Collapsible Accordion Sections */}
          <div className="border-t border-brand-champagne/20">
            {/* Section: SHOP */}
            <div className="border-b border-brand-champagne/20">
              <button
                type="button"
                onClick={() => toggleSection("shop")}
                aria-expanded={openSections.shop}
                aria-controls="mobile-footer-panel-shop"
                id="mobile-footer-btn-shop"
                className="flex w-full min-h-[42px] items-center justify-between py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-champagne"
              >
                <span className="font-serif text-[10.5px] font-bold uppercase tracking-[0.22em] text-brand-champagne-light">
                  Shop
                </span>
                <span className="flex h-5 w-5 items-center justify-center text-brand-champagne-light">
                  <Plus
                    className={`h-3 w-3 transition-transform duration-300 ${openSections.shop ? "rotate-45 text-white" : ""
                      }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              <div
                id="mobile-footer-panel-shop"
                role="region"
                aria-labelledby="mobile-footer-btn-shop"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.shop
                    ? "max-h-96 opacity-100 pb-2.5"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <ul className="space-y-0.5 pl-1">
                  {mobileShopLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={normalizeFooterLink(link.path)}
                        className="block font-sans text-[12px] leading-relaxed text-brand-porcelain/80 transition-colors hover:text-white py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section: HELP & POLICIES */}
            <div className="border-b border-brand-champagne/20">
              <button
                type="button"
                onClick={() => toggleSection("help")}
                aria-expanded={openSections.help}
                aria-controls="mobile-footer-panel-help"
                id="mobile-footer-btn-help"
                className="flex w-full min-h-[42px] items-center justify-between py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-champagne"
              >
                <span className="font-serif text-[10.5px] font-bold uppercase tracking-[0.22em] text-brand-champagne-light">
                  Help &amp; Policies
                </span>
                <span className="flex h-5 w-5 items-center justify-center text-brand-champagne-light">
                  <Plus
                    className={`h-3 w-3 transition-transform duration-300 ${openSections.help ? "rotate-45 text-white" : ""
                      }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              <div
                id="mobile-footer-panel-help"
                role="region"
                aria-labelledby="mobile-footer-btn-help"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.help
                    ? "max-h-96 opacity-100 pb-2.5"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <ul className="space-y-0.5 pl-1">
                  {mobileHelpLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={normalizeFooterLink(link.path)}
                        className="block font-sans text-[12px] leading-relaxed text-brand-porcelain/80 transition-colors hover:text-white py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section: ABOUT */}
            <div className="border-b border-brand-champagne/20">
              <button
                type="button"
                onClick={() => toggleSection("about")}
                aria-expanded={openSections.about}
                aria-controls="mobile-footer-panel-about"
                id="mobile-footer-btn-about"
                className="flex w-full min-h-[42px] items-center justify-between py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-champagne"
              >
                <span className="font-serif text-[10.5px] font-bold uppercase tracking-[0.22em] text-brand-champagne-light">
                  About
                </span>
                <span className="flex h-5 w-5 items-center justify-center text-brand-champagne-light">
                  <Plus
                    className={`h-3 w-3 transition-transform duration-300 ${openSections.about ? "rotate-45 text-white" : ""
                      }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              <div
                id="mobile-footer-panel-about"
                role="region"
                aria-labelledby="mobile-footer-btn-about"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.about
                    ? "max-h-96 opacity-100 pb-2.5"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <ul className="space-y-0.5 pl-1">
                  {mobileAboutLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={normalizeFooterLink(link.path)}
                        className="block font-sans text-[12px] leading-relaxed text-brand-porcelain/80 transition-colors hover:text-white py-0.5"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Connect Directly (Visible without accordion) */}
          <div className="py-2 space-y-1.5">
            <h4 className="font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-brand-champagne-light">
              Connect Directly
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={`mailto:${activeEmail}`}
                className="inline-flex items-center gap-1.5 text-brand-porcelain/85 hover:text-brand-champagne-light transition-colors py-0.5"
              >
                <Mail className="h-3 w-3 text-brand-champagne shrink-0" />
                <span className="font-sans text-[11px] truncate max-w-[200px]">{activeEmail}</span>
              </a>

              <a
                href={`tel:${activePhone}`}
                className="inline-flex items-center gap-1.5 text-brand-porcelain/85 hover:text-brand-champagne-light transition-colors py-0.5"
              >
                <Phone className="h-3 w-3 text-brand-champagne shrink-0" />
                <span className="font-sans text-[11px]">{activePhone}</span>
              </a>
            </div>

            {/* TEMP UI HIDE: Footer social icons.
            <div className="pt-0.5">
              <div className="flex items-center gap-2">
                {[
                  { Icon: Facebook, link: settings.socialLinks?.facebook, label: "Facebook" },
                  { Icon: Twitter, link: settings.socialLinks?.twitter, label: "Twitter" },
                  { Icon: Instagram, link: settings.socialLinks?.instagram, label: "Instagram" },
                  { Icon: Youtube, link: settings.socialLinks?.youtube, label: "Youtube" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={normalizeExternalLink(social.link)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-6.5 w-6.5 items-center justify-center rounded-md border border-brand-champagne/30 bg-brand-plum/80 text-brand-porcelain/75 transition-all duration-300 hover:border-brand-champagne hover:text-brand-champagne active:scale-95"
                  >
                    <social.Icon className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div> */}
          </div>

          {/* Security Advisory (Compact Mobile Row) */}
          <div className="border-t border-brand-champagne/20 pt-1.5 pb-1">
            <div className="flex items-start gap-1.5 rounded-md border border-brand-champagne/20 bg-brand-champagne/5 px-2 py-1">
              <ShieldCheck className="h-3 w-3 text-brand-champagne shrink-0 mt-0.5" />
              <p className="font-sans text-[10px] leading-snug text-brand-porcelain/75">
                <span className="font-serif font-bold text-brand-champagne-light uppercase tracking-wider mr-1">
                  Security Advisory:
                </span>
                {globalSettings?.fraudWarning ||
                  settings.fraudWarning ||
                  "Alankar Jewellers never asks for confidential banking details, OTPs, or passwords over phone or email."}
              </p>
            </div>
          </div>

          {/* Delivery / Trust Row */}
          <div className="flex items-center justify-center gap-1.5 pt-1 pb-0.5 text-center">
            <Truck className="h-3 w-3 text-brand-champagne shrink-0" />
            <span className="font-sans text-[9px] uppercase tracking-[0.16em] font-semibold text-brand-champagne-light">
              {globalSettings?.footerDeliveryText ||
                settings.footerDeliveryText ||
                "Safe & Insured Worldwide Delivery"}
            </span>
          </div>

          {/* Copyright */}
          <div className="border-t border-brand-taupe/20 pt-1.5 text-center">
            <p className="font-sans text-[10px] text-brand-porcelain/60">
              &copy; {new Date().getFullYear()}{" "}
              {globalSettings?.footerCopyrightText ||
                settings.footerCopyrightText ||
                `${activeStoreName}. All Rights Reserved.`}
            </p>
          </div>
        </div>

        {/* ── DESKTOP & TABLET VIEW (md+) ── */}
        <div className="hidden md:block">
          <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-12 lg:mb-12 lg:gap-12">
            {/* Brand Section */}
            <div className="space-y-3 md:col-span-5 lg:col-span-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <Link
                  to="/"
                  className="inline-block transition-transform hover:scale-105 duration-500"
                >
                  <img
                    src={activeLogo}
                    alt={activeStoreName}
                    className="h-14 sm:h-16 lg:h-18 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultLogo;
                    }}
                  />
                </Link>
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold leading-tight tracking-wide text-white md:text-xl">
                    {activeTagline} <br />
                    <span className="italic font-serif text-brand-champagne font-light">
                      {activeSubTagline}
                    </span>
                  </h3>
                  <p className="max-w-sm font-sans text-[12px] leading-relaxed text-brand-porcelain/75 md:text-[13px]">
                    {activeDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1 md:gap-6 md:pt-2">
                {[
                  { Icon: ShieldCheck, label: "Secure" },
                  { Icon: Star, label: "925 Pure" },
                  { Icon: Heart, label: "Verified" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 group cursor-default"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-champagne/40 bg-brand-plum text-brand-champagne shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-champagne group-hover:text-brand-espresso md:h-10 md:w-10">
                      <badge.Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-brand-porcelain/70 font-bold group-hover:text-brand-champagne-light transition-colors">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-4 pt-0 md:col-span-7 md:grid-cols-3 md:gap-6 md:pt-4 lg:col-span-5 lg:gap-8">
              {[
                {
                  title: settings.footerColumn1Title,
                  links: settings.footerExperienceLinks,
                },
                {
                  title: settings.footerColumn2Title,
                  links: settings.footerPoliciesLinks,
                },
                {
                  title: settings.footerColumn3Title,
                  links: settings.footerWorldLinks,
                },
              ].map((col, i) => (
                <div key={i} className={`space-y-2.5 md:space-y-4 ${i === 2 ? "col-span-2 md:col-span-1" : ""}`}>
                  <h4 className="mb-1 border-b border-brand-champagne/30 pb-1.5 font-serif text-[11px] font-bold uppercase tracking-[0.25em] text-brand-champagne-light md:mb-2 md:pb-2">
                    {col.title}
                  </h4>
                  <ul className="space-y-1.5 md:space-y-2.5">
                    {col.links?.map((link, idx) => (
                      <li key={idx}>
                        <Link
                          to={normalizeFooterLink(link.path)}
                          className="group inline-flex items-center font-sans text-[12px] leading-5 text-brand-porcelain/75 transition-all hover:translate-x-1 hover:text-brand-white md:text-[13px]"
                        >
                          <span className="w-1.5 h-[1px] bg-brand-champagne mr-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Contact Card */}
            <div className="md:col-span-12 lg:col-span-3">
              <div className="group relative space-y-4 overflow-hidden rounded-2xl border border-brand-champagne/30 bg-brand-plum p-4 shadow-xl shadow-brand-espresso/40 md:space-y-6 md:rounded-[2rem] md:p-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-champagne/5 rounded-bl-full -z-0 group-hover:scale-[2] transition-transform duration-1000"></div>

                <div className="relative z-10 space-y-3 md:space-y-5">
                  <h4 className="font-serif text-brand-champagne-light font-bold uppercase tracking-[0.25em] text-[11px]">
                    Connect Directly
                  </h4>
                  <div className="space-y-2.5 md:space-y-4">
                    <a
                      href={`mailto:${activeEmail}`}
                      className="group/item flex items-center gap-3 md:gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-brand-champagne/50 bg-brand-plum text-brand-champagne-light shadow-sm transition-all duration-500 group-hover/item:bg-brand-champagne group-hover/item:text-brand-espresso md:h-10 md:w-10 md:rounded-[14px]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-medium text-brand-porcelain/85 hover:text-brand-champagne-light transition-colors break-all">
                        {activeEmail}
                      </span>
                    </a>
                    <a
                      href={`tel:${activePhone}`}
                      className="group/item flex items-center gap-3 md:gap-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-brand-champagne/50 bg-brand-plum text-brand-champagne-light shadow-sm transition-all duration-500 group-hover/item:bg-brand-champagne group-hover/item:text-brand-espresso md:h-10 md:w-10 md:rounded-[14px]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-medium text-brand-porcelain/85 hover:text-brand-champagne-light transition-colors">
                        {activePhone}
                      </span>
                    </a>
                    <div className="group/item flex items-start gap-3 md:gap-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-brand-champagne/50 bg-brand-plum text-brand-champagne-light shadow-sm transition-all duration-500 group-hover/item:bg-brand-champagne group-hover/item:text-brand-espresso md:h-10 md:w-10 md:rounded-[14px]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] font-normal text-brand-porcelain/85 leading-relaxed">
                        {activeAddress}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-brand-taupe/30 pt-3 md:space-y-3 md:pt-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-porcelain/65">
                      Social Gallery
                    </p>
                    {/* TEMP UI HIDE: Social Gallery icons.
                    <div className="flex gap-2.5">
                      {[
                        { Icon: Facebook, link: settings.socialLinks?.facebook },
                        { Icon: Twitter, link: settings.socialLinks?.twitter },
                        {
                          Icon: Instagram,
                          link: settings.socialLinks?.instagram,
                        },
                        { Icon: Youtube, link: settings.socialLinks?.youtube },
                      ].map((social, i) => (
                        <a
                          key={i}
                          href={normalizeExternalLink(social.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 bg-brand-plum border border-brand-taupe/40 rounded-xl flex items-center justify-center text-brand-porcelain/70 hover:border-brand-blush hover:text-brand-blush hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                        >
                          <social.Icon className="w-4 h-4" />
                        </a>
                      ))}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mb-5 max-w-4xl rounded-2xl border border-brand-champagne/20 bg-brand-plum/70 px-3 py-3 shadow-sm backdrop-blur-sm md:mb-8 md:px-6 md:py-3.5">
            <div className="flex items-start gap-3 md:items-center md:gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-champagne/10 border border-brand-champagne/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-brand-champagne" />
              </div>
              <p className="text-[11px] text-brand-porcelain/70 font-sans leading-relaxed">
                <span className="font-bold text-brand-champagne-light mr-2 uppercase tracking-wide">
                  SECURITY ADVISORY:
                </span>
                {globalSettings?.fraudWarning ||
                  settings.fraudWarning ||
                  "Alankar Jewellers will NEVER ask for OTPs, passwords, or sensitive financial information via unsolicited calls, WhatsApp, or emails."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-taupe/30 pt-4 md:flex-row md:gap-6 md:pt-6">
            <div className="flex items-center gap-3 bg-brand-plum px-4 py-2 rounded-full border border-brand-champagne/30 shadow-xs">
              <Truck className="w-4 h-4 text-brand-champagne" />
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-brand-champagne-light">
                {globalSettings?.footerDeliveryText || settings.footerDeliveryText}
              </span>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1.5">
              <p className="text-[10px] text-brand-porcelain/55 uppercase tracking-[0.25em] font-semibold">
                &copy; {new Date().getFullYear()}{" "}
                {globalSettings?.footerCopyrightText ||
                  settings.footerCopyrightText ||
                  "Alankar Jewellers. All Rights Reserved."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
