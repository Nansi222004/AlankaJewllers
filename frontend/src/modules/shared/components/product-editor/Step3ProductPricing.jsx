import React, { useState } from 'react';
import {
    Calculator, IndianRupee, Scale, Sparkles, CheckCircle2,
    AlertTriangle, Plus, Trash2, X, Info, Tag, Layers, ChevronDown,
    ChevronUp, ShieldCheck, Zap
} from 'lucide-react';
import { FormSection, Input, Select } from '../../../admin/components/common/FormControls';
import AlankarJewelleryMark from '../AlankarJewelleryMark';
import {
    getPricingForVariant,
    getPricingConfigurationError,
    getTenGramRate
} from '../../utils/productEditorUtils';

const Step3ProductPricing = ({
    formData,
    setFormData,
    isViewMode,
    metalRates = {},
    gstRate = 3,
    rateSourceInfo = { source: 'API Mitra', isLive: true },
    handleVariantChange,
    handleDiamondSpecChange,
    addVariant,
    removeVariant,
    activeVariantIndex = 0,
    setActiveVariantIndex
}) => {
    // Local state for optional toggles on metal products
    const [includeDiamondsMap, setIncludeDiamondsMap] = useState({});
    const [includeGemstonesMap, setIncludeGemstonesMap] = useState({});

    const variants = formData.variants || [];
    const currentVariant = variants[activeVariantIndex] || variants[0] || {};
    const pricing = getPricingForVariant(currentVariant, formData, metalRates, gstRate);
    const pricingConfigError = getPricingConfigurationError(formData, metalRates);

    const isGold = formData.material === 'Gold';
    const isSilver = formData.material === 'Silver';
    const isDiamondMaterial = formData.material === 'Diamond';
    const isGemsMaterial = formData.material === 'Gems';
    const isOther = formData.material === 'Other';

    // Purity label helper
    const selectedPurity = isGold ? `${formData.goldCategory || '18'}K` : (formData.silverCategory || '925 Silver');
    const tenGramRate = getTenGramRate(formData, metalRates);
    const perGramRate = tenGramRate > 0 ? (tenGramRate / 10).toFixed(2) : '0.00';

    // Helper to check if gemstone section should be open for variant
    const hasGemstonesConfigured = (v) => {
        return isGemsMaterial ||
            (Array.isArray(v.gemstonePricing) && v.gemstonePricing.length > 0) ||
            Boolean(includeGemstonesMap[v.id]);
    };

    // Helper to check if diamond section should be open for variant
    const hasDiamondsConfigured = (v) => {
        return isDiamondMaterial ||
            (v.diamondType && v.diamondType !== 'none') ||
            Boolean(v.diamondPricing?.enabled) ||
            Boolean(includeDiamondsMap[v.id]);
    };

    const toggleGemstonesForVariant = (variantId) => {
        setIncludeGemstonesMap(prev => {
            const nextVal = !prev[variantId];
            if (!nextVal) {
                // If closing, clear gemstones array if user wants
            } else {
                // If opening, ensure at least one stone exists if empty
                if (!currentVariant.gemstonePricing || currentVariant.gemstonePricing.length === 0) {
                    const stones = [{
                        gemstoneType: 'Ruby',
                        quantity: 1,
                        weight: 0,
                        pricingMode: 'total',
                        pricePerCarat: 0,
                        totalPrice: 0,
                        certificateCharge: 0
                    }];
                    handleVariantChange(variantId, 'gemstonePricing', stones);
                }
            }
            return { ...prev, [variantId]: nextVal };
        });
    };

    const toggleDiamondsForVariant = (variantId) => {
        setIncludeDiamondsMap(prev => {
            const nextVal = !prev[variantId];
            handleVariantChange(variantId, 'diamondPricing', {
                ...(currentVariant.diamondPricing || {}),
                enabled: nextVal
            });
            if (nextVal && (!currentVariant.diamondType || currentVariant.diamondType === 'none')) {
                handleVariantChange(variantId, 'diamondType', 'natural');
            }
            return { ...prev, [variantId]: nextVal };
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        03
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Pricing Architecture</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Authoritative bullion valuation, artisan making charges, and automated tax calculations</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 3 of 8
                    </span>
                </div>
            </div>

            {/* LIVE RATE RESOLVER BANNER */}
            <div className="bg-gradient-to-r from-[#2C1810] to-[#3E2723] rounded-2xl p-5 text-white shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                            <Coins size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                    {isGold ? 'Live Gold Rates' : isSilver ? 'Live Silver Rates' : isDiamondMaterial || isGemsMaterial ? `${formData.settingMetal || 'Setting'} Reference Rate` : 'Manual Fixed Pricing'}
                                </span>
                                {tenGramRate > 0 && !isOther && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Rate Source: {rateSourceInfo.source || 'API Mitra'} {rateSourceInfo.isLive ? '(Live)' : '(Verified)'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-stone-300 mt-1">
                                {isGold && `Resolved ${selectedPurity} Gold: ₹${Number(tenGramRate).toLocaleString('en-IN')} / 10g (₹${perGramRate}/g)`}
                                {isSilver && `Resolved ${selectedPurity}: ₹${Number(tenGramRate).toLocaleString('en-IN')} / 10g (₹${perGramRate}/g)`}
                                {(isDiamondMaterial || isGemsMaterial) && `Mounting (${formData.settingPurity || '18K'} ${formData.settingMetal || 'Gold'}): ₹${Number(tenGramRate).toLocaleString('en-IN')} / 10g`}
                                {isOther && `Fixed admin pricing mode. No live bullion rates applied.`}
                            </p>
                        </div>
                    </div>

                    {/* Rates Pills */}
                    {isGold && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            {['24', '22', '18', '14'].map((k) => {
                                const rate = metalRates.gold10g?.[`k${k}`] || 0;
                                const isCurrent = formData.goldCategory === k;
                                return (
                                    <div
                                        key={k}
                                        className={`px-3 py-1.5 rounded-xl border transition-all ${isCurrent
                                            ? 'bg-amber-400 text-[#2C1810] font-bold border-amber-300 shadow-sm'
                                            : 'bg-white/5 text-stone-300 border-white/10'
                                            }`}
                                    >
                                        <span className="font-semibold">{k}K:</span> ₹{Number(rate).toLocaleString('en-IN')}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {isSilver && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <div className={`px-3 py-1.5 rounded-xl border ${formData.silverCategory?.includes('925') ? 'bg-amber-400 text-[#2C1810] font-bold border-amber-300' : 'bg-white/5 text-stone-300 border-white/10'}`}>
                                <span className="font-semibold">925 Sterling:</span> ₹{Number(metalRates.silver10g?.sterling925 || 0).toLocaleString('en-IN')} / 10g
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl border ${formData.silverCategory === '999' ? 'bg-amber-400 text-[#2C1810] font-bold border-amber-300' : 'bg-white/5 text-stone-300 border-white/10'}`}>
                                <span className="font-semibold">999 Fine:</span> ₹{Number(metalRates.silver10g?.silverOther || 0).toLocaleString('en-IN')} / 10g
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Zero Price or Configuration Alert */}
            {pricingConfigError && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-red-600 shrink-0" />
                    <span>{pricingConfigError} Configure active store rates in Admin → Metal Pricing before publishing.</span>
                </div>
            )}

            {/* PAYMENT GATEWAY FEE BEARER (Global Product Rule) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-amber-700" />
                            <h3 className="text-sm font-bold text-gray-900">Payment Gateway (PG) Fee Bearer Protocol</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                            Choose who bears the payment gateway processing charge.
                            <br />
                            • <strong>Store:</strong> Alankar absorbs the payment gateway fee (0% customer surcharge).
                            <br />
                            • <strong>Customer:</strong> 2% payment gateway surcharge is added to the customer-facing final price.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {[
                            { value: 'store', label: 'Store (Alankar Absorbs - 0%)' },
                            { value: 'user', label: 'Customer (2% Surcharge)' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={isViewMode}
                                onClick={() => setFormData({ ...formData, paymentGatewayChargeBearer: opt.value })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${(formData.paymentGatewayChargeBearer || 'store') === opt.value
                                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* VARIANT TABS SELECTOR (If multi-variant) */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {variants.map((v, idx) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => setActiveVariantIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeVariantIndex === idx
                                ? 'bg-[#3E2723] text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span>{v.name || `Variant #${idx + 1}`}</span>
                            {v.weight && <span className="opacity-75 text-[10px]">({v.weight}{v.weightUnit?.[0] || 'g'})</span>}
                        </button>
                    ))}
                </div>

                {!isViewMode && (
                    <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all shrink-0"
                    >
                        <Plus size={13} /> Add Variant
                    </button>
                )}
            </div>

            {/* CURRENT VARIANT PRICING WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Columns: Pricing Inputs */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Weight & Standard Charges */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <Scale size={14} className="text-amber-700" />
                                Weight & Making Charges ({currentVariant.name || 'Standard'})
                            </h4>
                            {variants.length > 1 && !isViewMode && (
                                <button
                                    type="button"
                                    onClick={() => removeVariant(currentVariant.id)}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                    <Trash2 size={13} /> Delete Variant
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Variant Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentVariant.name || ''}
                                    onChange={(e) => handleVariantChange(currentVariant.id, 'name', e.target.value)}
                                    placeholder="e.g. Standard, Size 12, 18-inch"
                                    disabled={isViewMode}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none focus:border-[#3E2723]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Size Reference <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentVariant.size || ''}
                                    onChange={(e) => handleVariantChange(currentVariant.id, 'size', e.target.value)}
                                    placeholder="e.g. 14, 2.4, 45cm"
                                    disabled={isViewMode}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-gray-900 outline-none focus:border-[#3E2723]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Variant Metal Weight <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={currentVariant.weight ?? ''}
                                        onChange={(e) => handleVariantChange(currentVariant.id, 'weight', e.target.value)}
                                        placeholder="0.00"
                                        disabled={isViewMode}
                                        className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-900 outline-none focus:border-[#3E2723]"
                                    />
                                    <select
                                        value={currentVariant.weightUnit || 'Grams'}
                                        onChange={(e) => handleVariantChange(currentVariant.id, 'weightUnit', e.target.value)}
                                        disabled={isViewMode}
                                        className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-2 text-xs font-semibold text-gray-700 outline-none"
                                    >
                                        <option value="Grams">Grams</option>
                                        <option value="Milligrams">Milligrams</option>
                                    </select>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Net precious metal weight excluding stones.</span>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Making Charges (₹) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={currentVariant.makingCharge ?? '0'}
                                        onChange={(e) => handleVariantChange(currentVariant.id, 'makingCharge', e.target.value)}
                                        placeholder="0"
                                        disabled={isViewMode}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-[#3E2723]"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Artisan craftsmanship and fabrication fee.</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Hallmarking Charge (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={currentVariant.hallmarkingCharge ?? '0'}
                                        onChange={(e) => handleVariantChange(currentVariant.id, 'hallmarkingCharge', e.target.value)}
                                        placeholder="0"
                                        disabled={isViewMode}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-[#3E2723]"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Government BIS hallmarking & assay fee.</span>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1">
                                    Additional Charges (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={currentVariant.additionalCharge ?? '0'}
                                        onChange={(e) => handleVariantChange(currentVariant.id, 'additionalCharge', e.target.value)}
                                        placeholder="0"
                                        disabled={isViewMode}
                                        className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-[#3E2723]"
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Packaging, handling, or specialty finishing fees.</span>
                            </div>
                        </div>
                    </div>

                    {/* CONDITIONAL DIAMOND PRICING SECTION */}
                    {hasDiamondsConfigured(currentVariant) ? (
                        <div className="bg-pink-50/40 rounded-2xl p-6 border border-pink-200/70 shadow-xs space-y-5 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b border-pink-200/60 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-pink-100 rounded-lg text-pink-700">
                                        <AlankarJewelleryMark size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-pink-900">Diamond Pricing (Admin Controlled)</h4>
                                        <p className="text-[10px] text-pink-700/80">No market pricing applied — values set directly by admin</p>
                                    </div>
                                </div>

                                {!isDiamondMaterial && !isViewMode && (
                                    <button
                                        type="button"
                                        onClick={() => toggleDiamondsForVariant(currentVariant.id)}
                                        className="text-[11px] font-semibold text-pink-700 hover:text-pink-900"
                                    >
                                        Remove Diamonds
                                    </button>
                                )}
                            </div>

                            {/* 4Cs Specifications */}
                            <div>
                                <label className="text-[11px] font-bold text-pink-900 uppercase tracking-wider block mb-2">
                                    Diamond Specifications (Informational 4Cs)
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                    {[
                                        { label: 'Carat', key: 'carat', placeholder: '0.50' },
                                        { label: 'Clarity', key: 'clarity', placeholder: 'VVS1' },
                                        { label: 'Color', key: 'color', placeholder: 'G-H' },
                                        { label: 'Cut', key: 'cut', placeholder: 'Round' },
                                        { label: 'Shape', key: 'shape', placeholder: 'Solitaire' },
                                        { label: 'Count', key: 'diamondCount', placeholder: '1', type: 'number' }
                                    ].map((spec) => (
                                        <div key={spec.key}>
                                            <span className="text-[9px] font-bold text-pink-800/70 uppercase block mb-1">{spec.label}</span>
                                            <input
                                                type={spec.type || 'text'}
                                                value={currentVariant.diamondSpecs?.[spec.key] || ''}
                                                onChange={(e) => handleDiamondSpecChange(currentVariant.id, spec.key, e.target.value)}
                                                placeholder={spec.placeholder}
                                                disabled={isViewMode}
                                                className="w-full bg-white border border-pink-200 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-900 outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Diamond Pricing Valuation */}
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-pink-900 block mb-1">Pricing Method</label>
                                        <select
                                            value={currentVariant.diamondPricing?.pricingMode || 'total'}
                                            onChange={(e) => handleVariantChange(currentVariant.id, 'diamondPricing', {
                                                ...(currentVariant.diamondPricing || {}),
                                                enabled: true,
                                                pricingMode: e.target.value
                                            })}
                                            disabled={isViewMode}
                                            className="w-full bg-white border border-pink-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-900 outline-none"
                                        >
                                            <option value="total">Total Diamond Amount (Fixed Lump Sum)</option>
                                            <option value="per_carat">Per Carat × Carat Weight</option>
                                        </select>
                                    </div>

                                    {(currentVariant.diamondPricing?.pricingMode || 'total') === 'total' ? (
                                        <div>
                                            <label className="text-xs font-semibold text-pink-900 block mb-1">Total Diamond Value (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentVariant.diamondPricing?.totalPrice ?? (currentVariant.diamondPrice || '')}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        handleVariantChange(currentVariant.id, 'diamondPricing', {
                                                            ...(currentVariant.diamondPricing || {}),
                                                            enabled: true,
                                                            totalPrice: val
                                                        });
                                                        handleVariantChange(currentVariant.id, 'diamondPrice', val);
                                                    }}
                                                    placeholder="0"
                                                    disabled={isViewMode}
                                                    className="w-full bg-white border border-pink-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-pink-500"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-xs font-semibold text-pink-900 block mb-1">Price Per Carat (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentVariant.diamondPricing?.pricePerCarat ?? ''}
                                                    onChange={(e) => handleVariantChange(currentVariant.id, 'diamondPricing', {
                                                        ...(currentVariant.diamondPricing || {}),
                                                        enabled: true,
                                                        pricePerCarat: e.target.value
                                                    })}
                                                    placeholder="0"
                                                    disabled={isViewMode}
                                                    className="w-full bg-white border border-pink-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none focus:border-pink-500"
                                                />
                                            </div>
                                            <span className="text-[10px] text-pink-700 mt-1 block">
                                                Total = {currentVariant.diamondSpecs?.carat || '0'} ct × ₹{currentVariant.diamondPricing?.pricePerCarat || 0} = ₹{pricing.diamondPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-pink-900 block mb-1">Diamond Certificate Fee (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={currentVariant.diamondPricing?.certificateCharge ?? (currentVariant.diamondCertificateCharge || '0')}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    handleVariantChange(currentVariant.id, 'diamondPricing', {
                                                        ...(currentVariant.diamondPricing || {}),
                                                        certificateCharge: val
                                                    });
                                                    handleVariantChange(currentVariant.id, 'diamondCertificateCharge', val);
                                                }}
                                                placeholder="0"
                                                disabled={isViewMode}
                                                className="w-full bg-white border border-pink-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-gray-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-pink-900 block mb-1">Certificate Report Link</label>
                                        <input
                                            type="url"
                                            value={currentVariant.diamondPricing?.certificateUrl || ''}
                                            onChange={(e) => handleVariantChange(currentVariant.id, 'diamondPricing', {
                                                ...(currentVariant.diamondPricing || {}),
                                                certificateUrl: e.target.value
                                            })}
                                            placeholder="https://..."
                                            disabled={isViewMode}
                                            className="w-full bg-white border border-pink-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-900 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Subtle Diamond Opt-in for Gold/Silver */
                        <div className="bg-white rounded-2xl p-4 border border-dashed border-pink-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <AlankarJewelleryMark size={16} className="text-pink-600" />
                                <span className="text-xs font-semibold text-gray-700">Does this piece include Diamonds?</span>
                            </div>
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={() => toggleDiamondsForVariant(currentVariant.id)}
                                    className="px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-all flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Diamond Details
                                </button>
                            )}
                        </div>
                    )}

                    {/* CONDITIONAL GEMSTONE PRICING SECTION */}
                    {hasGemstonesConfigured(currentVariant) ? (
                        <div className="bg-purple-50/40 rounded-2xl p-6 border border-purple-200/70 shadow-xs space-y-5 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">Gemstone Valuation (Admin Controlled)</h4>
                                        <p className="text-[10px] text-purple-700/80">Admin-controlled — no automatic market pricing applied</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const stones = Array.isArray(currentVariant.gemstonePricing) ? [...currentVariant.gemstonePricing] : [];
                                                stones.push({
                                                    gemstoneType: 'Ruby',
                                                    quantity: 1,
                                                    weight: 0,
                                                    pricingMode: 'total',
                                                    pricePerCarat: 0,
                                                    totalPrice: 0,
                                                    certificateCharge: 0
                                                });
                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-all flex items-center gap-1"
                                        >
                                            <Plus size={13} /> Add Stone
                                        </button>
                                    )}
                                    {!isGemsMaterial && !isViewMode && (
                                        <button
                                            type="button"
                                            onClick={() => toggleGemstonesForVariant(currentVariant.id)}
                                            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 ml-2"
                                        >
                                            Dismiss
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Stones List */}
                            {(!currentVariant.gemstonePricing || currentVariant.gemstonePricing.length === 0) ? (
                                <div className="text-center py-4 bg-white/60 rounded-xl border border-dashed border-purple-200">
                                    <p className="text-xs text-purple-600 font-medium">No gemstones currently added. Click "+ Add Stone" above to configure stones.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentVariant.gemstonePricing.map((stone, stoneIdx) => {
                                        const stoneValue = stone.pricingMode === 'per_carat'
                                            ? ((Number(stone.weight) || 0) * (Number(stone.pricePerCarat) || 0))
                                            : (Number(stone.totalPrice) || 0);

                                        return (
                                            <div key={stoneIdx} className="bg-white rounded-xl p-4 border border-purple-100 shadow-xs relative space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                                        <Sparkles size={12} className="text-purple-600" />
                                                        Stone #{stoneIdx + 1} ({stone.gemstoneType || 'Ruby'})
                                                    </span>
                                                    {!isViewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const stones = currentVariant.gemstonePricing.filter((_, i) => i !== stoneIdx);
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Stone Type</label>
                                                        <select
                                                            value={stone.gemstoneType || 'Ruby'}
                                                            onChange={(e) => {
                                                                const stones = [...currentVariant.gemstonePricing];
                                                                stones[stoneIdx] = { ...stones[stoneIdx], gemstoneType: e.target.value };
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-900 outline-none"
                                                        >
                                                            <option value="Ruby">Ruby</option>
                                                            <option value="Emerald">Emerald</option>
                                                            <option value="Sapphire">Sapphire</option>
                                                            <option value="Pearl">Pearl</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Quantity</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={stone.quantity ?? 1}
                                                            onChange={(e) => {
                                                                const stones = [...currentVariant.gemstonePricing];
                                                                stones[stoneIdx] = { ...stones[stoneIdx], quantity: e.target.value };
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-900 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Weight (ct)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={stone.weight ?? 0}
                                                            onChange={(e) => {
                                                                const stones = [...currentVariant.gemstonePricing];
                                                                stones[stoneIdx] = { ...stones[stoneIdx], weight: e.target.value };
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-900 outline-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Pricing Mode</label>
                                                        <select
                                                            value={stone.pricingMode || 'total'}
                                                            onChange={(e) => {
                                                                const stones = [...currentVariant.gemstonePricing];
                                                                stones[stoneIdx] = { ...stones[stoneIdx], pricingMode: e.target.value };
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-semibold text-gray-900 outline-none"
                                                        >
                                                            <option value="total">Total Stone Value</option>
                                                            <option value="per_carat">Per Carat × Wt</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1">
                                                    {stone.pricingMode === 'per_carat' ? (
                                                        <div className="sm:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Price Per Carat (₹)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={stone.pricePerCarat ?? 0}
                                                                    onChange={(e) => {
                                                                        const stones = [...currentVariant.gemstonePricing];
                                                                        stones[stoneIdx] = { ...stones[stoneIdx], pricePerCarat: e.target.value };
                                                                        handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                                    }}
                                                                    disabled={isViewMode}
                                                                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-6 pr-2 text-xs font-bold text-gray-900 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="sm:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Total Stone Price (₹)</label>
                                                            <div className="relative">
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={stone.totalPrice ?? 0}
                                                                    onChange={(e) => {
                                                                        const stones = [...currentVariant.gemstonePricing];
                                                                        stones[stoneIdx] = { ...stones[stoneIdx], totalPrice: e.target.value };
                                                                        handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                                    }}
                                                                    disabled={isViewMode}
                                                                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-6 pr-2 text-xs font-bold text-gray-900 outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Cert Fee (₹)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={stone.certificateCharge ?? 0}
                                                            onChange={(e) => {
                                                                const stones = [...currentVariant.gemstonePricing];
                                                                stones[stoneIdx] = { ...stones[stoneIdx], certificateCharge: e.target.value };
                                                                handleVariantChange(currentVariant.id, 'gemstonePricing', stones);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold text-gray-900 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center text-[11px] bg-purple-50/70 px-3 py-1.5 rounded-lg text-purple-900 font-semibold">
                                                    <span>Computed Stone Value:</span>
                                                    <span>₹{stoneValue.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Subtle Gemstone Opt-in for plain Gold / Silver pieces */
                        <div className="bg-white rounded-2xl p-4 border border-dashed border-purple-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Sparkles size={16} className="text-purple-600" />
                                <span className="text-xs font-semibold text-gray-700">Does this piece include Gemstones (Ruby, Emerald, Sapphire etc.)?</span>
                            </div>
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={() => toggleGemstonesForVariant(currentVariant.id)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-all flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Gemstones
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right 5 Columns: Calculated Breakdown & Zero Price Guard */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5 sticky top-24">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                                <Calculator size={14} className="text-amber-700" />
                                Live Pricing Breakdown
                            </h4>
                            <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
                                Automated Engine
                            </span>
                        </div>

                        {/* Itemized Table */}
                        <div className="space-y-2.5 text-xs text-gray-600">
                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Precious Metal Value</span>
                                <span className="font-bold text-gray-900">₹{pricing.metalPrice.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Making Charges</span>
                                <span className="font-bold text-gray-900">₹{pricing.makingCharge.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Diamond Value</span>
                                <span className={`font-bold ${pricing.diamondPrice > 0 ? 'text-pink-700' : 'text-gray-400'}`}>
                                    {pricing.diamondPrice > 0 ? `₹${pricing.diamondPrice.toFixed(2)}` : 'Not applicable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Gemstone Value</span>
                                <span className={`font-bold ${pricing.gemstonePrice > 0 ? 'text-purple-700' : 'text-gray-400'}`}>
                                    {pricing.gemstonePrice > 0 ? `₹${pricing.gemstonePrice.toFixed(2)}` : 'Not applicable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Hallmarking Fee</span>
                                <span className="font-bold text-gray-900">
                                    {pricing.hallmarkingCharge > 0 ? `₹${pricing.hallmarkingCharge.toFixed(2)}` : 'Not applicable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Certificate Charges</span>
                                <span className="font-bold text-gray-900">
                                    {(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge) > 0
                                        ? `₹${(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge).toFixed(2)}`
                                        : 'Not applicable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1 border-b border-gray-50">
                                <span>Additional Charges</span>
                                <span className="font-bold text-gray-900">
                                    {pricing.additionalCharge > 0 ? `₹${pricing.additionalCharge.toFixed(2)}` : 'Not applicable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded-lg font-bold text-gray-800">
                                <span>Taxable Subtotal</span>
                                <span>₹{pricing.subtotalBeforeTax.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1 text-gray-700">
                                <span>GST ({gstRate}%)</span>
                                <span className="font-semibold">₹{pricing.gstValue.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1 text-gray-700">
                                <span>Price After GST</span>
                                <span className="font-semibold">₹{pricing.priceAfterTax.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center py-1 text-gray-700">
                                <span>Payment Gateway ({pricing.pgChargePercent}%)</span>
                                <span className="font-semibold">
                                    {pricing.pgChargeAmount > 0 ? `₹${pricing.pgChargeAmount.toFixed(2)}` : '₹0.00 (Store Absorbed)'}
                                </span>
                            </div>

                            {/* Final Price Card */}
                            <div className="pt-3">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Final Product Price</span>
                                        <span className="text-xl font-extrabold tracking-tight">₹{pricing.finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                                            Checkout Ready
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Zero Price Protection Alert */}
                            {pricing.finalPrice <= 0 && (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-start gap-2 animate-pulse">
                                    <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
                                    <div>
                                        <span>PRICE UNAVAILABLE</span>
                                        <p className="text-[11px] font-normal text-red-800 mt-0.5">
                                            Configure a valid metal weight, rates, or stone pricing. Sellable products can never be published with ₹0 price.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3ProductPricing;
