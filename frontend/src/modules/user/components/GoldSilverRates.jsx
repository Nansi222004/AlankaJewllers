import { useEffect, useMemo, useState } from 'react';
import { Coins, MapPin, RefreshCw } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { useMetalRateCities, useMetalRates } from '../hooks/useMetalRates';
import { formatRateUnit } from '../utils/referenceMetalRate';

const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

const normalize = (value) => String(value || '').trim().toLowerCase();

const GoldSilverRates = () => {
    const { pincodeData } = useShop();
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
    const cards = [
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

    return (
        <section className="relative overflow-hidden bg-[#FBF7F1] py-12 md:py-16" aria-labelledby="metal-rates-title">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-champagne/10 blur-3xl" />
            <div className="relative mx-auto max-w-[1450px] px-4 md:px-8">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-plum">
                            <Coins className="h-4 w-4" /> Today's reference rates
                        </span>
                        <h2 id="metal-rates-title" className="font-display text-3xl font-bold text-brand-espresso md:text-4xl">
                            Gold &amp; Silver Rates
                        </h2>
                        <p className="mt-2 max-w-xl text-sm text-stone-500">
                            City-wise market rates for reference. Product selling prices remain unchanged.
                        </p>
                    </div>

                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[480px]">
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
                                className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-brand-espresso outline-none focus:border-brand-champagne disabled:opacity-60"
                            >
                                {!states.length && <option>{citiesQuery.isLoading ? 'Loading locations...' : 'Location unavailable'}</option>}
                                {states.map((group) => <option key={group.state} value={group.state}>{group.state}</option>)}
                            </select>
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            City
                            <select
                                value={selectedCity}
                                disabled={!cityOptions.length}
                                onChange={(event) => setSelectedCity(event.target.value)}
                                className="mt-2 w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-brand-espresso outline-none focus:border-brand-champagne disabled:opacity-60"
                            >
                                {!cityOptions.length && <option>{citiesQuery.isLoading ? 'Loading locations...' : (rates?.city || citiesQuery.data?.defaultCity || 'Default city')}</option>}
                                {cityOptions.map((city) => <option key={city.apiCity} value={city.apiCity}>{city.name}</option>)}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 md:gap-5">
                    {cards.map(([label, value]) => (
                        <article key={label} className="min-w-0 rounded-2xl border border-brand-border/70 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 md:p-6">
                            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 md:text-xs">{label}</p>
                            <p className="mt-3 break-words text-xl font-bold text-brand-espresso md:text-2xl">
                                {isLoadingRates ? 'Loading...' : (value?.rate > 0 ? currency.format(value.rate) : 'Rate unavailable')}
                            </p>
                            {value?.rate > 0 && <p className="mt-1 text-xs font-semibold text-brand-plum">{formatRateUnit(value.unit)}</p>}
                        </article>
                    ))}
                </div>

                <div className="mt-6 flex flex-col gap-2 text-[11px] font-medium text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {rates?.city || citiesQuery.data?.defaultCity || 'Configured city'}</span>
                        <span>Updated at: {updatedAt || 'Rate unavailable'}</span>
                        <span>Source: API Mitra</span>
                    </div>
                    {(rates?.isStale || ratesQuery.isError) && (
                        <span className="inline-flex items-center gap-1.5 text-amber-700"><RefreshCw className="h-3.5 w-3.5" /> {rates?.isStale ? 'Showing last available rate' : 'Rates temporarily unavailable'}</span>
                    )}
                </div>
            </div>
        </section>
    );
};

export default GoldSilverRates;
