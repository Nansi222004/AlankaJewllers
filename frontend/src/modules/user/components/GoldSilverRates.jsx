import { useEffect, useMemo, useState } from 'react';
import { Coins, MapPin, RefreshCw } from 'lucide-react';
import AlankaJewelleryMark from './AlankaJewelleryMark';
import { useShop } from '../../../context/ShopContext';
import { useMetalRateCities, useMetalRates } from '../hooks/useMetalRates';
import { formatRateUnit } from '../utils/referenceMetalRate';

const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

const normalize = (value) => String(value || '').trim().toLowerCase();

const GoldSilverRates = ({ metal }) => {
    const { pincodeData, activeMetal } = useShop();
    const mode = (metal || activeMetal || 'all').toLowerCase();
    const isGoldMode = mode === 'gold';
    const isSilverMode = mode === 'silver';

    const citiesQuery = useMetalRateCities();
    const states = useMemo(() => citiesQuery.data?.states || [], [citiesQuery.data?.states]);
    const deliveryCity = String(pincodeData?.city || '').split('/')[0].trim();
    const allCities = useMemo(() => states.flatMap((group) => group.cities || []), [states]);
    const preferredCity = useMemo(() => {
        const deliveryMatch = allCities.find((city) => normalize(city.name) === normalize(deliveryCity));
        if (deliveryMatch) return deliveryMatch;
        const defaultName = citiesQuery.data?.defaultCity;
        return allCities.find((city) => normalize(city.name) === normalize(defaultName)) || null;
    }, [allCities, citiesQuery.data?.defaultCity, deliveryCity]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        if (!preferredCity) return;
        setSelectedState(preferredCity.state);
        setSelectedCity(preferredCity.apiCity);
    }, [preferredCity]);

    const cityOptions = states.find((group) => group.state === selectedState)?.cities || [];
    const ratesQuery = useMetalRates(selectedCity || deliveryCity);
    const rates = ratesQuery.data;
    const isLoadingRates = ratesQuery.isLoading;

    const goldCards = [
        ['24K Gold', rates?.gold?.['24K']],
        ['22K Gold', rates?.gold?.['22K']],
        ['18K Gold', rates?.gold?.['18K']],
    ];

    const silverValue = rates?.silver;

    const allCards = [
        ['24K Gold', rates?.gold?.['24K']],
        ['22K Gold', rates?.gold?.['22K']],
        ['18K Gold', rates?.gold?.['18K']],
        ['Silver', rates?.silver],
    ];

    const updatedAt = rates?.updatedAt
        ? new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        }).format(new Date(rates.updatedAt))
        : null;

    const currentCityName = rates?.city || citiesQuery.data?.defaultCity || 'Indore';

    return (
        <section
            className={`relative overflow-hidden py-12 md:py-16 ${
                isSilverMode
                    ? 'bg-gradient-to-b from-[#FBF8F7] via-[#F8EFF0] to-[#FBF8F7] border-y border-[#E9DEDA]/70'
                    : 'bg-[#FBF7F1] border-y border-brand-border-soft/60'
            }`}
            aria-labelledby="metal-rates-title"
        >
            {/* Ambient decorative glows */}
            <div
                className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl pointer-events-none ${
                    isSilverMode ? 'bg-[#D9B8B6]/20' : 'bg-brand-champagne/10'
                }`}
            />
            {isSilverMode && (
                <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-[#C98F96]/15 blur-3xl pointer-events-none" />
            )}

            <div className="relative mx-auto max-w-[1450px] px-4 md:px-8">
                {/* Header & City Selector */}
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span
                            className={`mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${
                                isSilverMode ? 'text-[#6B3F46]' : 'text-brand-plum'
                            }`}
                        >
                            {isSilverMode ? (
                                <AlankaJewelleryMark className="h-3.5 w-3.5 text-[#C98F96]" />
                            ) : (
                                <Coins className="h-4 w-4" />
                            )}
                            {isGoldMode
                                ? "Today's Gold Rates"
                                : isSilverMode
                                ? "Today's Silver Rate"
                                : "Today's reference rates"}
                        </span>
                        <h2
                            id="metal-rates-title"
                            className="font-display text-3xl font-bold text-brand-espresso md:text-4xl"
                        >
                            {isGoldMode
                                ? "Today's Gold Rates"
                                : isSilverMode
                                ? "Today's Silver Rate"
                                : 'Gold & Silver Rates'}
                        </h2>
                        <p className="mt-2 max-w-xl text-sm text-stone-500">
                            {isGoldMode
                                ? 'City-wise live reference rates for genuine hallmarked gold. Product selling prices remain unchanged.'
                                : isSilverMode
                                ? 'City-wise live reference rate for 999 fine silver. Product selling prices remain unchanged.'
                                : 'City-wise market rates for reference. Product selling prices remain unchanged.'}
                        </p>
                    </div>

                    {/* State & City Controls */}
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[440px]">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            State
                            <select
                                value={selectedState}
                                disabled={!states.length}
                                onChange={(event) => {
                                    const state = event.target.value;
                                    const firstCity = states.find((group) => group.state === state)?.cities?.[0];
                                    setSelectedState(state);
                                    setSelectedCity(firstCity?.apiCity || '');
                                }}
                                className={`mt-2 w-full rounded-xl border ${
                                    isSilverMode
                                        ? 'border-[#E9DEDA] focus:border-[#C98F96]'
                                        : 'border-brand-border focus:border-brand-champagne'
                                } bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-brand-espresso outline-none disabled:opacity-60 shadow-2xs`}
                            >
                                {!states.length && (
                                    <option>
                                        {citiesQuery.isLoading ? 'Loading locations...' : 'Location unavailable'}
                                    </option>
                                )}
                                {states.map((group) => (
                                    <option key={group.state} value={group.state}>
                                        {group.state}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            City
                            <select
                                value={selectedCity}
                                disabled={!cityOptions.length}
                                onChange={(event) => setSelectedCity(event.target.value)}
                                className={`mt-2 w-full rounded-xl border ${
                                    isSilverMode
                                        ? 'border-[#E9DEDA] focus:border-[#C98F96]'
                                        : 'border-brand-border focus:border-brand-champagne'
                                } bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-brand-espresso outline-none disabled:opacity-60 shadow-2xs`}
                            >
                                {!cityOptions.length && (
                                    <option>
                                        {citiesQuery.isLoading
                                            ? 'Loading locations...'
                                            : rates?.city || citiesQuery.data?.defaultCity || 'Default city'}
                                    </option>
                                )}
                                {cityOptions.map((city) => (
                                    <option key={city.apiCity} value={city.apiCity}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* ── MODE 1: SILVER ONLY (Single Intentional, Centered Luxury Card) ── */}
                {isSilverMode ? (
                    <div className="mx-auto max-w-xl">
                        <article className="relative overflow-hidden rounded-3xl border border-[#E9DEDA] bg-gradient-to-br from-white via-[#FCF8F7] to-[#F7EDED] p-6 sm:p-8 shadow-[0_8px_30px_rgba(107,63,70,0.08)] transition-all duration-300 hover:border-[#C98F96]/60 hover:shadow-[0_12px_35px_rgba(107,63,70,0.12)]">
                            {/* Decorative ambient background accents */}
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#D9B8B6]/20 blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[#B8956A]/15 blur-2xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Badge pill */}
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#F1DFDE] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#6B3F46] border border-[#D9B8B6]/60">
                                    <AlankaJewelleryMark className="h-3.5 w-3.5 text-[#C98F96]" />
                                    <span>999 Fine Silver Reference</span>
                                </div>

                                {/* Metal Label */}
                                <span className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-[#332827]/70">
                                    SILVER
                                </span>

                                {/* Price */}
                                <div className="mt-2 flex items-baseline justify-center gap-2">
                                    <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#332827] tracking-tight">
                                        {isLoadingRates
                                            ? 'Loading...'
                                            : silverValue?.rate > 0
                                            ? currency.format(silverValue.rate)
                                            : 'Rate unavailable'}
                                    </span>
                                    {silverValue?.rate > 0 && (
                                        <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6B3F46] border border-[#E9DEDA] shadow-2xs">
                                            {formatRateUnit(silverValue.unit)}
                                        </span>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#C98F96]/40 to-transparent" />

                                {/* Meta information: City, Timestamp, Source */}
                                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-stone-500 font-medium">
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#332827]">
                                        <MapPin className="h-3.5 w-3.5 text-[#C98F96]" /> {currentCityName}
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span>Updated: {updatedAt || 'Recently'}</span>
                                    <span className="text-stone-300">•</span>
                                    <span className="font-semibold text-[#6B3F46]">Source: API Mitra</span>
                                </div>
                            </div>
                        </article>
                    </div>
                ) : isGoldMode ? (
                    /* ── MODE 2: GOLD ONLY (3 Balanced Columns: 24K, 22K, 18K) ── */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                        {goldCards.map(([label, value]) => (
                            <article
                                key={label}
                                className="min-w-0 rounded-2xl border border-brand-champagne/40 bg-white p-5 shadow-[0_4px_20px_rgba(184,149,106,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-champagne md:p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-espresso">
                                        {label}
                                    </span>
                                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                        Hallmarked
                                    </span>
                                </div>
                                <p className="mt-3 break-words font-serif text-2xl font-bold text-brand-espresso md:text-3xl">
                                    {isLoadingRates
                                        ? 'Loading...'
                                        : value?.rate > 0
                                        ? currency.format(value.rate)
                                        : 'Rate unavailable'}
                                </p>
                                {value?.rate > 0 && (
                                    <p className="mt-1 text-xs font-semibold text-brand-champagne">
                                        {formatRateUnit(value.unit)}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                ) : (
                    /* ── MODE 3: ALL METALS (4 Columns: 24K, 22K, 18K, Silver) ── */
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-5">
                        {allCards.map(([label, value]) => (
                            <article
                                key={label}
                                className="min-w-0 rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 md:p-6"
                            >
                                <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 md:text-xs">
                                    {label}
                                </p>
                                <p className="mt-3 break-words text-xl font-bold text-brand-espresso md:text-2xl">
                                    {isLoadingRates
                                        ? 'Loading...'
                                        : value?.rate > 0
                                        ? currency.format(value.rate)
                                        : 'Rate unavailable'}
                                </p>
                                {value?.rate > 0 && (
                                    <p className="mt-1 text-xs font-semibold text-brand-plum">
                                        {formatRateUnit(value.unit)}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}

                {/* Footer Meta / Stale warning (for non-silver mode or secondary status) */}
                {!isSilverMode && (
                    <div className="mt-6 flex flex-col gap-2 text-[11px] font-medium text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> {currentCityName}
                            </span>
                            <span>Updated at: {updatedAt || 'Rate unavailable'}</span>
                            <span>Source: API Mitra</span>
                        </div>
                        {(rates?.isStale || ratesQuery.isError) && (
                            <span className="inline-flex items-center gap-1.5 text-amber-700">
                                <RefreshCw className="h-3.5 w-3.5" />{' '}
                                {rates?.isStale ? 'Showing last available rate' : 'Rates temporarily unavailable'}
                            </span>
                        )}
                    </div>
                )}

                {isSilverMode && (rates?.isStale || ratesQuery.isError) && (
                    <div className="mt-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                            <RefreshCw className="h-3.5 w-3.5" />{' '}
                            {rates?.isStale ? 'Showing last available rate' : 'Rates temporarily unavailable'}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GoldSilverRates;
