import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../../context/ShopContext';
import toast from 'react-hot-toast';

const PincodeModal = () => {
    const { 
        isPincodeModalOpen, 
        setIsPincodeModalOpen, 
        pincode: currentPincode, 
        checkPincodeServiceability,
        pincodeLoading 
    } = useShop();

    const [tempPincode, setTempPincode] = useState(currentPincode || '');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isPincodeModalOpen) {
            setTempPincode(currentPincode || '');
            setError('');
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isPincodeModalOpen, currentPincode]);

    if (!isPincodeModalOpen) return null;

    const handleApply = async (overridePin) => {
        const pinToCheck = String(overridePin || tempPincode || '').trim();
        if (pinToCheck.length !== 6 || !/^\d+$/.test(pinToCheck)) {
            const msg = "Please enter a valid 6-digit pincode";
            setError(msg);
            toast.error(msg);
            return;
        }

        if (overridePin) {
            setTempPincode(overridePin);
        }
        setError('');

        const res = await checkPincodeServiceability(pinToCheck);
        if (res?.serviceable) {
            setIsPincodeModalOpen(false);
            const locationInfo = res.city ? `${res.city.split('/')[0].trim()}, ${res.state}` : (res.state || pinToCheck);
            toast.success(`Delivery pincode updated to ${pinToCheck} (${locationInfo})`);
        } else {
            const failureMsg = res?.reason || "Pincode is currently not serviceable for delivery";
            setError(failureMsg);
            toast.error(failureMsg);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.loading("Fetching your location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                toast.dismiss();
                // Production-safe behavior: we don't guess a pincode without reverse geocoding.
                // If/when we add a real geocode provider, we can auto-fill.
                console.log('Geolocation detected:', position?.coords);
                toast.success("Location detected. Please enter your pincode.");
            },
            (error) => {
                toast.dismiss();
                toast.error("Unable to retrieve your location");
                console.error(error);
            }
        );
    };

    const popularCities = [
        { name: 'Mumbai', code: '400001' },
        { name: 'Delhi', code: '110001' },
        { name: 'Bangalore', code: '560001' },
        { name: 'Pune', code: '411001' },
        { name: 'Kolkata', code: '700001' },
        { name: 'Chennai', code: '600001' }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsPincodeModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-brand-plum border-b border-brand-champagne/30 px-8 py-10 text-white relative">
                        <button 
                            onClick={() => setIsPincodeModalOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 text-stone-400 hover:text-white rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-brand-champagne/15 border border-brand-champagne/40 p-3 rounded-2xl text-brand-champagne-light">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-brand-pearl">Set Delivery Location</h2>
                                <p className="text-brand-champagne/80 text-xs tracking-wider uppercase">Enter your pincode to check serviceability</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="space-y-6">
                            {/* Pincode Input */}
                            <div className="relative">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 mb-2 block">Enter Pin Code</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={tempPincode}
                                        disabled={pincodeLoading}
                                        onChange={(e) => {
                                            setTempPincode(e.target.value.replace(/\D/g, ''));
                                            if (error) setError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (tempPincode.length === 6 && !pincodeLoading) {
                                                    handleApply();
                                                }
                                            }
                                        }}
                                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl py-4 px-6 text-lg font-bold tracking-widest text-brand-espresso focus:outline-none focus:border-brand-champagne focus:bg-white transition-all disabled:opacity-60"
                                        placeholder="000000"
                                    />
                                    <button 
                                        onClick={() => handleApply()}
                                        disabled={tempPincode.length !== 6 || pincodeLoading}
                                        className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                                            tempPincode.length === 6 && !pincodeLoading
                                            ? 'bg-brand-plum text-brand-champagne-light border border-brand-champagne/50 shadow-md hover:bg-brand-plum active:translate-y-0 cursor-pointer'
                                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {pincodeLoading ? 'Checking...' : 'Apply'}
                                    </button>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-medium">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px bg-stone-200 flex-1" />
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">OR</span>
                                <div className="h-px bg-stone-200 flex-1" />
                            </div>

                            {/* Use Current Location */}
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={pincodeLoading}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-brand-champagne/40 text-brand-espresso bg-amber-500/5 font-bold hover:bg-brand-champagne/10 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Navigation className="w-4 h-4 text-brand-champagne" />
                                <span className="text-sm font-semibold tracking-wide">Use Current Location</span>
                            </button>

                            {/* Quick Select */}
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-4 block">Popular Cities</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {popularCities.map(city => (
                                        <button
                                            key={city.code}
                                            disabled={pincodeLoading}
                                            onClick={() => handleApply(city.code)}
                                            className="px-3 py-2 rounded-xl border border-stone-200 text-[11px] font-semibold text-stone-700 hover:border-brand-champagne hover:text-brand-champagne hover:bg-amber-50/50 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer Warning */}
                    <div className="px-8 py-5 bg-stone-50 border-t border-stone-100 flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-brand-champagne shrink-0" />
                        <p className="text-[10px] text-stone-500 font-medium">Delivery times and availability may vary based on your selected location.</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PincodeModal;
