import React from 'react';
import { Box, Zap, ShieldCheck, Info, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { FormSection } from '../../../admin/components/common/FormControls';
import { getAvailableSerialCodes, normalizeSerialCodes } from '../../utils/productEditorUtils';

const Step4ProductInventory = ({
    formData,
    setFormData,
    errors = {},
    isViewMode,
    updateVariantSerialQuantity,
    activeVariantIndex = 0,
    setActiveVariantIndex
}) => {
    const variants = formData.variants || [];
    const currentVariant = variants[activeVariantIndex] || variants[0] || {};
    const availableCodes = getAvailableSerialCodes(currentVariant);
    const availableCount = availableCodes.length;
    const serializedCount = (currentVariant.serialCodes || []).length;
    const stockError = errors[`variant_${currentVariant.id}_stock`] || errors[`variant_${activeVariantIndex}_stock`];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        04
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Inventory & Stock Serialization</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Manage live sellable vault units and individual serialized jewellery piece tracking</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 4 of 8
                    </span>
                </div>
            </div>

            {/* Variant Switcher if multi-variant */}
            {variants.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 pb-3">
                    {variants.map((v, idx) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => setActiveVariantIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeVariantIndex === idx
                                    ? 'bg-[#3E2723] text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span>{v.name || `Variant #${idx + 1}`}</span>
                            <span className="opacity-75 text-[10px] ml-1.5">({getAvailableSerialCodes(v).length} in stock)</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 5 Columns: Stock Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <FormSection title={`Stock Allocation (${currentVariant.name || 'Standard'})`}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Sellable Live Units <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={availableCount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== '' && Number(val) < 0) return;
                                            updateVariantSerialQuantity(currentVariant.id, val);
                                        }}
                                        disabled={isViewMode}
                                        placeholder="0"
                                        className={`w-full bg-white border rounded-xl py-3 px-4 text-sm font-bold text-gray-900 outline-none focus:ring-2 transition-all ${
                                            stockError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/10'
                                        }`}
                                    />
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${availableCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Available</span>
                                    </div>
                                </div>
                                {stockError && <span className="text-xs text-red-500 font-medium mt-1 block">{stockError}</span>}
                                <p className="text-[11px] text-gray-500 mt-2 flex items-start gap-1.5">
                                    <Info size={13} className="text-amber-600 mt-0.5 shrink-0" />
                                    <span>Controls how many units are available for sale. Updating this number automatically provisions or syncs serialized tracking tags.</span>
                                </p>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Serialized Total</span>
                                    <span className="text-lg font-extrabold text-gray-800">{serializedCount}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Ready to Ship</span>
                                    <span className="text-lg font-extrabold text-emerald-800">{availableCount}</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 space-y-1">
                                <p className="font-semibold flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-amber-700" />
                                    Zero Stock Protection Protocol
                                </p>
                                <p className="text-[11px] leading-relaxed text-amber-800/90">
                                    A product cannot be published in Active status if stock is 0. If stock reaches zero after customer orders, the piece automatically switches to "Out of Stock" to protect inventory integrity.
                                </p>
                            </div>
                        </div>
                    </FormSection>
                </div>

                {/* Right 7 Columns: Serialized Unit Tracking */}
                <div className="lg:col-span-7 space-y-6">
                    <FormSection title="Serialized Unit Tracking Markers">
                        <div className="space-y-4">
                            {serializedCount > 0 ? (
                                <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                                    {(currentVariant.serialCodes || []).map((codeObj, cIdx) => {
                                        const status = codeObj.status || 'AVAILABLE';
                                        const isAvailable = status === 'AVAILABLE';
                                        return (
                                            <div 
                                                key={cIdx} 
                                                className="p-3.5 rounded-xl bg-white border border-gray-100 flex items-center justify-between shadow-xs hover:border-gray-200 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-gray-400 font-mono w-6">#{cIdx + 1}</span>
                                                    <input
                                                        type="text"
                                                        value={codeObj.code || ''}
                                                        onChange={(e) => {
                                                            if (isViewMode || !isAvailable) return;
                                                            const newCode = e.target.value.toUpperCase();
                                                            const nextVariants = formData.variants.map((v) => {
                                                                if (v.id !== currentVariant.id) return v;
                                                                const serialCodes = normalizeSerialCodes(v.serialCodes || []);
                                                                serialCodes[cIdx] = { ...serialCodes[cIdx], code: newCode };
                                                                return { ...v, serialCodes };
                                                            });
                                                            setFormData({ ...formData, variants: nextVariants });
                                                        }}
                                                        disabled={isViewMode || !isAvailable}
                                                        className="font-mono text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 outline-none focus:border-[#3E2723] uppercase"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                                        isAvailable 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 bg-gray-50/70 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                                    <Box size={28} className="text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-600">No Inventory Serialized</p>
                                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Enter a sellable live unit count on the left to generate unique serial tracking tags for each physical piece.</p>
                                </div>
                            )}
                        </div>
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default Step4ProductInventory;
