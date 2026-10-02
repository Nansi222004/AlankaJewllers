import React from 'react';
import { 
    Tag, Scale, Zap, IndianRupee, CheckCircle2 as SuccessIcon, 
    Layers, Calculator, Box, Barcode as BarcodeIcon, Copy, Download, 
    Plus, Trash2, ImagePlus, FileText, ChevronDown, ChevronUp, X, Info,
    CheckCircle2
} from 'lucide-react';
import Barcode from 'react-barcode';
import { roundCurrency, getPricingForVariant, getPricingConfigurationError, getAvailableSerialCodes, normalizeSerialCodes } from '../../utils/productEditorUtils';
import toast from 'react-hot-toast';
import AlankaJewelleryMark from '../AlankaJewelleryMark';

const ProductVariantsTab = ({ 
    formData, 
    setFormData, 
    errors, 
    isViewMode, 
    metalRates, 
    gstRate,
    handleVariantChange,
    handleDiamondSpecChange,
    addVariant,
    removeVariant,
    updateVariantSerialQuantity,
    handleDownloadAllSerialBarcodes,
    handleDownloadSerialBarcode,
    setSerialBarcodeRef,
    handleVariantImageUpload,
    handleRemoveVariantUpload,
    variantImagePreviews,
    handleRemoveSavedVariantImage,
    addVariantFaq,
    removeVariantFaq,
    handleVariantFaqChange,
    clearVariantFaqOverride,
    expandedVariant,
    setExpandedVariant
}) => {
    const toggleExpand = (id) => {
        setExpandedVariant(expandedVariant === id ? null : id);
    };

    const variantWeightUnitOptions = [
        { label: 'Grams', value: 'Grams' },
        { label: 'Milligrams', value: 'Milligrams' }
    ];
    const pricingConfigurationError = getPricingConfigurationError(formData, metalRates);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pricingConfigurationError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
                    {pricingConfigurationError} Update the actual client-provided rate in Admin → Metal Pricing before publishing.
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Product Variants</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage multiple sizes, weights, and specifications</p>
                </div>
                {!isViewMode && (
                    <button 
                        type="button" 
                        onClick={addVariant}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#3E2723] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                    >
                        <Plus size={14} /> Add New Variant
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {formData.variants.map((v, idx) => {
                    const availableCount = getAvailableSerialCodes(v).length;
                    const pricing = getPricingForVariant(v, formData, metalRates, gstRate);
                    const isExpanded = expandedVariant === v.id;
                    const nameError = errors[`variant_${v.id}_name`] || errors[`variant_${idx}_name`];
                    const weightError = errors[`variant_${v.id}_weight`] || errors[`variant_${idx}_weight`];
                    const stockError = errors[`variant_${v.id}_stock`] || errors[`variant_${idx}_stock`];
                    const priceError = errors[`variant_${v.id}_price`] || errors[`variant_${idx}_price`];
                    const makingError = errors[`variant_${v.id}_makingCharge`] || errors[`variant_${idx}_makingCharge`];
                    const hallmarkingError = errors[`variant_${v.id}_hallmarkingCharge`] || errors[`variant_${idx}_hallmarkingCharge`];
                    const diamondPriceError = errors[`variant_${v.id}_diamondPrice`] || errors[`variant_${idx}_diamondPrice`];
                    const certError = errors[`variant_${v.id}_diamondCertificateCharge`] || errors[`variant_${idx}_diamondCertificateCharge`];
                    const additionalError = errors[`variant_${v.id}_additionalCharge`] || errors[`variant_${idx}_additionalCharge`];

                    return (
                        <div key={v.id} className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${isExpanded ? 'border-amber-200 shadow-xl ring-1 ring-amber-100' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
                            {/* Variant Header/Summary */}
                            <div 
                                className={`p-4 sm:p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-amber-50/30' : 'hover:bg-gray-50'}`}
                                onClick={() => toggleExpand(v.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${isExpanded ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-gray-900 uppercase tracking-wide">{v.name || 'Untitled Variant'}</span>
                                            {idx === 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest">Primary</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Scale size={10} /> {v.weight || '0'} {v.weightUnit}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Zap size={10} /> {availableCount} In Stock
                                            </span>
                                            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                                ₹ {pricing.finalPrice.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isViewMode && formData.variants.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeVariant(v.id);
                                            }} 
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                    <div className={`p-2 rounded-full border ${isExpanded ? 'border-amber-200 text-amber-600 bg-white' : 'border-gray-200 text-gray-400'}`}>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                            </div>

                            {/* Variant Body */}
                            {isExpanded && (
                                <div className="p-4 sm:p-8 pt-2 border-t border-gray-100 space-y-10 animate-in slide-in-from-top-2 duration-300">
                                    {/* Physical Specifications */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                                    <Box size={14} />
                                                </div>
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Variant Details</h4>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Step 1</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <Tag size={10} className="text-amber-500" /> Variant Name <span className="text-red-500">*</span>
                                                </label>
                                                <input 
                                                    value={v.name} 
                                                    onChange={(e) => handleVariantChange(v.id, 'name', e.target.value)} 
                                                    disabled={isViewMode} 
                                                    className={`w-full bg-white border rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${nameError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`} 
                                                    placeholder="e.g. Standard, Small, Large" 
                                                />
                                                {nameError && <div className="text-[10px] text-red-500 mt-1 ml-1">{nameError}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <Tag size={10} className="text-amber-500" /> Size <span className="text-gray-300 font-normal">(Optional)</span>
                                                </label>
                                                <input 
                                                    value={v.size || ''} 
                                                    onChange={(e) => handleVariantChange(v.id, 'size', e.target.value)} 
                                                    disabled={isViewMode} 
                                                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-[#3E2723] focus:ring-4 focus:ring-[#3E2723]/5 transition-all shadow-sm"
                                                    placeholder="e.g. 12, 2.4, 18 inches" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <AlankaJewelleryMark size={10} className="text-amber-500" /> Diamond Type
                                                </label>
                                                <select
                                                    value={v.diamondType || formData.diamondType || 'none'}
                                                    onChange={(e) => handleVariantChange(v.id, 'diamondType', e.target.value)}
                                                    disabled={isViewMode}
                                                    className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-[#3E2723] focus:ring-4 focus:ring-[#3E2723]/5 transition-all shadow-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="none">No Diamonds</option>
                                                    <option value="lab_grown">Lab Grown</option>
                                                    <option value="natural">Natural</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <Scale size={10} className="text-amber-500" /> Variant Weight <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={v.weight ?? ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'weight', val);
                                                        }}
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'weight', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'weight', '');
                                                            }
                                                        }}
                                                        disabled={isViewMode}
                                                        className={`flex-1 min-w-0 bg-white border rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${weightError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`}
                                                        placeholder="0"
                                                        min={0}
                                                    />
                                                    <select
                                                        value={v.weightUnit || 'Grams'}
                                                        onChange={(e) => handleVariantChange(v.id, 'weightUnit', e.target.value)}
                                                        disabled={isViewMode}
                                                        className="w-24 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-2 text-[10px] font-black uppercase tracking-widest text-gray-600 outline-none focus:border-[#3E2723] transition-all cursor-pointer"
                                                    >
                                                        {variantWeightUnitOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {weightError && <div className="text-[10px] text-red-500 mt-1 ml-1">{weightError}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <Zap size={10} className="text-amber-500" /> Unit Stock
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={availableCount} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            updateVariantSerialQuantity(v.id, val);
                                                        }} 
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                updateVariantSerialQuantity(v.id, '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                updateVariantSerialQuantity(v.id, 0);
                                                            }
                                                        }}
                                                        disabled={isViewMode} 
                                                        className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 outline-none focus:border-[#3E2723] focus:ring-4 focus:ring-[#3E2723]/5 transition-all shadow-sm" 
                                                        placeholder="0" 
                                                        min={0}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${availableCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <IndianRupee size={10} className="text-amber-500" /> Making Charge
                                                </label>
                                                <div className="relative group">
                                                    <input 
                                                        type="number" 
                                                        value={v.makingCharge} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'makingCharge', val);
                                                        }} 
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'makingCharge', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'makingCharge', '0');
                                                            }
                                                        }}
                                                        disabled={isViewMode} 
                                                        className={`w-full bg-white border rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${makingError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`} 
                                                        placeholder="0" 
                                                        min={0}
                                                    />
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                                </div>
                                                {makingError && <div className="text-[10px] text-red-500 mt-1 ml-1">{makingError}</div>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <CheckCircle2 size={10} className="text-amber-500" /> Hallmarking Charge
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={v.hallmarkingCharge ?? '0'} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'hallmarkingCharge', val);
                                                        }} 
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'hallmarkingCharge', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'hallmarkingCharge', '0');
                                                            }
                                                        }}
                                                        disabled={isViewMode} 
                                                        className={`w-full bg-white border rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${hallmarkingError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`} 
                                                        placeholder="0"
                                                        min={0}
                                                    />
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                                </div>
                                                {hallmarkingError && <div className="text-[10px] text-red-500 mt-1 ml-1">{hallmarkingError}</div>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <AlankaJewelleryMark size={10} className="text-amber-500" /> Legacy Diamond / Stones
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={v.diamondPrice ?? '0'}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'diamondPrice', val);
                                                        }}
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'diamondPrice', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'diamondPrice', '0');
                                                            }
                                                        }}
                                                        disabled={isViewMode}
                                                        className={`w-full bg-white border rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${diamondPriceError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`}
                                                        placeholder="0"
                                                        min={0}
                                                    />
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                                </div>
                                                {diamondPriceError && <div className="text-[10px] text-red-500 mt-1 ml-1">{diamondPriceError}</div>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <FileText size={10} className="text-amber-500" /> Certificate Charge
                                                </label>
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={v.diamondCertificateCharge ?? '0'} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'diamondCertificateCharge', val);
                                                        }} 
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'diamondCertificateCharge', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'diamondCertificateCharge', '0');
                                                            }
                                                        }}
                                                        disabled={isViewMode} 
                                                        className={`w-full bg-white border rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${certError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`} 
                                                        placeholder="0"
                                                        min={0}
                                                    />
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                                </div>
                                                {certError && <div className="text-[10px] text-red-500 mt-1 ml-1">{certError}</div>}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                    <IndianRupee size={10} className="text-amber-500" /> Additional Charges
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={v.additionalCharge ?? '0'}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '' && Number(val) < 0) return;
                                                            handleVariantChange(v.id, 'additionalCharge', val);
                                                        }}
                                                        onFocus={(e) => {
                                                            if (e.target.value === '0' || Number(e.target.value) === 0) {
                                                                handleVariantChange(v.id, 'additionalCharge', '');
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            if (e.target.value === '') {
                                                                handleVariantChange(v.id, 'additionalCharge', '0');
                                                            }
                                                        }}
                                                        disabled={isViewMode}
                                                        className={`w-full bg-white border rounded-xl py-3.5 pl-12 pr-5 text-sm font-bold text-gray-800 outline-none focus:ring-4 transition-all shadow-sm ${additionalError ? 'border-red-400 focus:border-red-500 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/5'}`}
                                                        placeholder="0"
                                                        min={0}
                                                    />
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
                                                </div>
                                                {additionalError && <div className="text-[10px] text-red-500 mt-1 ml-1">{additionalError}</div>}
                                            </div>
                                        </div>
                                    </div>                                    {/* Pricing Breakdown */}
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                                    <Calculator size={14} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Pricing Breakdown</h4>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Automated Pricing Intelligence</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Step 2</span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Metal Price</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.metalPrice.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Making Charge</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.makingCharge.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Diamond Value</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.diamondPrice.toFixed(2)}
                                                </div>
                                            </div>
                                            {pricing.gemstonePrice > 0 && (
                                                <div>
                                                    <label className="text-xs font-medium text-purple-600 mb-1 block">Gemstone Value</label>
                                                    <div className="w-full bg-purple-50 border border-purple-100 rounded-lg py-2 px-3 text-sm font-semibold text-purple-800 flex items-center gap-1.5">
                                                        <span className="text-xs text-purple-400">₹</span> {pricing.gemstonePrice.toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Hallmarking</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.hallmarkingCharge.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Certificate Charges</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge).toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Additional Charges</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.additionalCharge.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Subtotal</label>
                                                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-500">₹</span> {pricing.subtotalBeforeTax.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">GST ({gstRate}%)</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.gstValue.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end mt-4">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">Price After GST</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.priceAfterTax.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 mb-1 block">PG Charge ({pricing.pgChargePercent}%)</label>
                                                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <span className="text-xs text-gray-400">₹</span> {pricing.pgChargeAmount.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1.5">
                                                    <SuccessIcon size={12} /> Final Variant Price
                                                </label>
                                                <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-lg py-2 px-4 text-base font-bold text-amber-900 flex items-center justify-between">
                                                    <span className="text-xs font-medium text-amber-700">Total</span>
                                                    <span>₹ {pricing.finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {priceError && <div className="text-[10px] text-red-500 mt-1">{priceError}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inventory & Serialization */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                                                    <Zap size={14} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Inventory Sync</h4>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Control stock levels and serialization</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Step 3</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serialized Quantity</label>
                                                <div className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-5 text-sm font-bold text-gray-800 shadow-sm">
                                                    {v.serialCodes?.length || 0}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Live Stock Units</label>
                                                <div className="flex items-center justify-between w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 text-sm font-black text-gray-600 shadow-inner">
                                                    <span>{availableCount}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${availableCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">In Stock</span>
                                                    </div>
                                                </div>
                                                {stockError && <div className="text-[10px] text-red-500 mt-1">{stockError}</div>}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-gray-50 pb-2 pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                                                    <BarcodeIcon size={14} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Identity & Barcode</h4>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Global identification and tracking markers</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Step 4</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Variant Signature</label>
                                                <div className="w-full bg-[#FDFBF7] border border-amber-100/50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center shadow-inner h-[142px]">
                                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Reference Code</span>
                                                    <span className="text-sm font-mono font-black text-gray-800 tracking-wide uppercase">{v.variantCode || 'PENDING ASSIGNMENT'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Visual Identifier</label>
                                                    {v.variantCode && v.serialCodes && v.serialCodes.length > 0 && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleDownloadAllSerialBarcodes(v)}
                                                            className="text-[8px] font-black text-[#8E2B45] uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Download size={10} /> Batch Export
                                                        </button>
                                                    )}
                                                </div>
                                                {v.serialCodes && v.serialCodes.length > 0 ? (
                                                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {v.serialCodes.map((codeObj, codeIdx) => {
                                                            const serialStatus = codeObj.status || 'AVAILABLE';
                                                            const statusClasses = serialStatus === 'AVAILABLE'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                : (serialStatus === 'SOLD_ONLINE' || serialStatus === 'SOLD ONLINE'
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-100');

                                                            return (
                                                                <div key={`${v.id}-serial-${codeIdx}`} className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col gap-3 shadow-sm">
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="min-w-0 flex-1 space-y-2">
                                                                            <input
                                                                                value={codeObj.code}
                                                                                onChange={(e) => {
                                                                                    if (isViewMode || serialStatus !== 'AVAILABLE') return;
                                                                                    const next = formData.variants.map((variantItem) => {
                                                                                        if (variantItem.id !== v.id) return variantItem;
                                                                                        const serialCodes = normalizeSerialCodes(variantItem.serialCodes || []);
                                                                                        serialCodes[codeIdx] = { ...serialCodes[codeIdx], code: e.target.value.toUpperCase() };
                                                                                        return { ...variantItem, serialCodes };
                                                                                    });
                                                                                    setFormData(prev => ({ ...prev, variants: next }));
                                                                                }}
                                                                                disabled={isViewMode || serialStatus !== 'AVAILABLE'}
                                                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-[10px] font-mono font-black placeholder:text-gray-300 focus:outline-none focus:border-[#3E2723] transition-all disabled:bg-gray-100 disabled:text-gray-400"
                                                                            />
                                                                            <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${statusClasses}`}>
                                                                                {serialStatus.replace('_', ' ')}
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDownloadSerialBarcode(codeObj.code)}
                                                                            className="shrink-0 p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#3E2723] hover:border-[#3E2723] transition-all cursor-pointer"
                                                                            title="Download unit barcode"
                                                                        >
                                                                            <Download size={14} />
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        className="bg-[#FDFBF7] border border-[#EFEBE9] rounded-xl px-3 py-3 overflow-hidden flex justify-center"
                                                                        ref={(node) => setSerialBarcodeRef(codeObj.code, node)}
                                                                    >
                                                                        <Barcode
                                                                            value={codeObj.code}
                                                                            width={1.2}
                                                                            height={30}
                                                                            fontSize={10}
                                                                            background="#FDFBF7"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="w-full aspect-[4/1] bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
                                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Set stock to generate barcodes</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diamond Specs (Conditional — Descriptive Only) */}
                                    {(formData.material === 'Diamond' || (v.diamondType || formData.diamondType) !== 'none') && (
                                        <div className="bg-pink-50/30 rounded-[2.5rem] p-4 sm:p-8 border border-pink-100/50 space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-pink-100 rounded-xl text-pink-600">
                                                        <AlankaJewelleryMark size={18} className="text-pink-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-pink-800 uppercase tracking-[0.2em]">Diamond Intelligence</h4>
                                                        <p className="text-[8px] font-bold text-pink-400 uppercase mt-0.5">High-precision optical specifications</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest">Origin:</label>
                                                    <select
                                                        value={v.diamondType || formData.diamondType || 'none'}
                                                        onChange={(e) => handleVariantChange(v.id, 'diamondType', e.target.value)}
                                                        disabled={isViewMode}
                                                        className="bg-white border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none focus:border-pink-500 transition-all shadow-xs"
                                                    >
                                                        <option value="none">Inherit / None</option>
                                                        <option value="natural">Natural Diamond</option>
                                                        <option value="lab_grown">Lab-Grown Diamond</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {/* Descriptive specs — informational, do NOT auto-generate price */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                                {[
                                                    { label: 'Carat', key: 'carat', placeholder: 'e.g. 0.50' },
                                                    { label: 'Clarity', key: 'clarity', placeholder: 'e.g. VVS1' },
                                                    { label: 'Color', key: 'color', placeholder: 'e.g. GH' },
                                                    { label: 'Cut', key: 'cut', placeholder: 'e.g. Brilliant' },
                                                    { label: 'Shape', key: 'shape', placeholder: 'e.g. Round' },
                                                    { label: 'Count', key: 'diamondCount', placeholder: '0', type: 'number' }
                                                ].map((spec) => (
                                                    <div key={spec.key} className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-pink-700/60 uppercase tracking-widest ml-1">{spec.label}</label>
                                                        <input
                                                            type={spec.type || 'text'}
                                                            value={v.diamondSpecs?.[spec.key] || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (spec.type === 'number' && val !== '' && Number(val) < 0) return;
                                                                handleDiamondSpecChange(v.id, spec.key, val);
                                                            }}
                                                            disabled={isViewMode}
                                                            className="w-full bg-white border border-pink-100 rounded-xl py-2.5 px-4 text-xs font-bold text-gray-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-sm"
                                                            placeholder={spec.placeholder}
                                                            min={spec.type === 'number' ? 0 : undefined}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Diamond Pricing — Admin-Controlled */}
                                            <div className="border-t border-pink-100 pt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[9px] font-black text-pink-800 uppercase tracking-widest">Diamond Pricing</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <span className="text-[9px] font-black text-pink-600 uppercase tracking-widest">Use Structured Pricing</span>
                                                        <div
                                                            onClick={() => !isViewMode && handleVariantChange(v.id, 'diamondPricing', {
                                                                ...(v.diamondPricing || {}),
                                                                enabled: !(v.diamondPricing?.enabled)
                                                            })}
                                                            className={`relative w-10 h-5 rounded-full transition-all cursor-pointer ${v.diamondPricing?.enabled ? 'bg-pink-500' : 'bg-gray-200'}`}
                                                        >
                                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${v.diamondPricing?.enabled ? 'left-5' : 'left-0.5'}`} />
                                                        </div>
                                                    </label>
                                                </div>

                                                {v.diamondPricing?.enabled ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {/* Pricing Mode */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest ml-1">Pricing Mode</label>
                                                            <select
                                                                value={v.diamondPricing?.pricingMode || 'total'}
                                                                onChange={(e) => handleVariantChange(v.id, 'diamondPricing', { ...(v.diamondPricing || {}), pricingMode: e.target.value })}
                                                                disabled={isViewMode}
                                                                className="w-full bg-white border border-pink-200 rounded-xl py-2.5 px-4 text-xs font-bold text-gray-800 outline-none focus:border-pink-500 transition-all"
                                                            >
                                                                <option value="total">Total Price (Admin enters full amount)</option>
                                                                <option value="per_carat">Per Carat × Carat Weight</option>
                                                            </select>
                                                        </div>

                                                        {/* Price field based on mode */}
                                                        {(v.diamondPricing?.pricingMode || 'total') === 'total' ? (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest ml-1">Total Diamond Price (₹)</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={v.diamondPricing?.totalPrice ?? ''}
                                                                        onChange={(e) => handleVariantChange(v.id, 'diamondPricing', { ...(v.diamondPricing || {}), totalPrice: e.target.value })}
                                                                        disabled={isViewMode}
                                                                        className="w-full bg-white border border-pink-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-gray-800 outline-none focus:border-pink-500 transition-all"
                                                                        placeholder="0"
                                                                        min={0}
                                                                    />
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rs</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest ml-1">Price Per Carat (₹)</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="number"
                                                                        value={v.diamondPricing?.pricePerCarat ?? ''}
                                                                        onChange={(e) => handleVariantChange(v.id, 'diamondPricing', { ...(v.diamondPricing || {}), pricePerCarat: e.target.value })}
                                                                        disabled={isViewMode}
                                                                        className="w-full bg-white border border-pink-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-gray-800 outline-none focus:border-pink-500 transition-all"
                                                                        placeholder="0"
                                                                        min={0}
                                                                    />
                                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rs</span>
                                                                </div>
                                                                <p className="text-[8px] text-pink-500 font-bold ml-1">× Carat from specs above = ₹{((parseFloat(v.diamondSpecs?.carat || '0') || 0) * (Number(v.diamondPricing?.pricePerCarat) || 0)).toFixed(2)}</p>
                                                            </div>
                                                        )}

                                                        {/* Certificate charge */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest ml-1">Certificate Charge (₹)</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={v.diamondPricing?.certificateCharge ?? ''}
                                                                    onChange={(e) => handleVariantChange(v.id, 'diamondPricing', { ...(v.diamondPricing || {}), certificateCharge: e.target.value })}
                                                                    disabled={isViewMode}
                                                                    className="w-full bg-white border border-pink-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-gray-800 outline-none focus:border-pink-500 transition-all"
                                                                    placeholder="0"
                                                                    min={0}
                                                                />
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">Rs</span>
                                                            </div>
                                                        </div>

                                                        {/* Certificate URL */}
                                                        <div className="sm:col-span-2 space-y-1.5">
                                                            <label className="text-[9px] font-black text-pink-700/70 uppercase tracking-widest ml-1">Certificate URL (GIA / IGI etc.)</label>
                                                            <input
                                                                type="url"
                                                                value={v.diamondPricing?.certificateUrl || ''}
                                                                onChange={(e) => handleVariantChange(v.id, 'diamondPricing', { ...(v.diamondPricing || {}), certificateUrl: e.target.value })}
                                                                disabled={isViewMode}
                                                                className="w-full bg-white border border-pink-200 rounded-xl py-2.5 px-4 text-xs font-bold text-gray-800 outline-none focus:border-pink-500 transition-all"
                                                                placeholder="https://www.gia.edu/report-check/..."
                                                            />
                                                        </div>

                                                        {/* Computed preview */}
                                                        <div className="sm:col-span-1 flex items-end">
                                                            <div className="w-full bg-pink-100/60 border border-pink-200 rounded-xl py-2.5 px-4">
                                                                <p className="text-[9px] font-black text-pink-700 uppercase tracking-widest">Diamond Component</p>
                                                                <p className="text-lg font-black text-pink-900">₹{pricing.diamondPrice.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white border border-pink-100 rounded-xl p-4">
                                                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Using legacy Diamond / Stones field above</p>
                                                        <p className="text-[9px] text-gray-400 mt-1">Enable Structured Pricing to use per-carat or managed total pricing.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Optional for metal products; primary pricing section for Gems products. */}
                                    {['Gold', 'Silver', 'Diamond', 'Gems', 'Gemstone'].includes(formData.material) && (
                                        <div className="bg-purple-50/30 rounded-[2.5rem] p-4 sm:p-8 border border-purple-100/50 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                                                        <AlankaJewelleryMark size={18} className="text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-purple-800 uppercase tracking-[0.2em]">Gemstone Pricing</h4>
                                                        <p className="text-[8px] font-bold text-purple-400 uppercase mt-0.5">Admin-Controlled — No automatic market pricing</p>
                                                    </div>
                                                </div>
                                                {!isViewMode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const stones = Array.isArray(v.gemstonePricing) ? [...v.gemstonePricing] : [];
                                                            stones.push({ gemstoneType: 'Ruby', quantity: 1, weight: 0, pricingMode: 'total', pricePerCarat: 0, totalPrice: 0, certificateCharge: 0 });
                                                            handleVariantChange(v.id, 'gemstonePricing', stones);
                                                        }}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all"
                                                    >
                                                        <Plus size={12} /> Add Stone
                                                    </button>
                                                )}
                                            </div>

                                            {(v.gemstonePricing || []).length === 0 ? (
                                                <div className="bg-white border border-purple-100 rounded-xl p-4 text-center">
                                                    <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">No gemstones added yet. Click Add Stone to begin.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {(v.gemstonePricing || []).map((stone, stoneIdx) => {
                                                        const stonePrice = stone.pricingMode === 'per_carat'
                                                            ? ((Number(stone.weight) || 0) * (Number(stone.pricePerCarat) || 0)).toFixed(2)
                                                            : (Number(stone.totalPrice) || 0).toFixed(2);
                                                        return (
                                                            <div key={stoneIdx} className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 relative">
                                                                {!isViewMode && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const stones = [...(v.gemstonePricing || [])].filter((_, i) => i !== stoneIdx);
                                                                            handleVariantChange(v.id, 'gemstonePricing', stones);
                                                                        }}
                                                                        className="absolute top-3 right-3 p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Stone Type</label>
                                                                        <select
                                                                            value={stone.gemstoneType || 'Ruby'}
                                                                            onChange={(e) => {
                                                                                const stones = [...(v.gemstonePricing || [])];
                                                                                stones[stoneIdx] = { ...stones[stoneIdx], gemstoneType: e.target.value };
                                                                                handleVariantChange(v.id, 'gemstonePricing', stones);
                                                                            }}
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                        >
                                                                            <option value="Ruby">Ruby</option>
                                                                            <option value="Emerald">Emerald</option>
                                                                            <option value="Sapphire">Sapphire</option>
                                                                            <option value="Pearl">Pearl</option>
                                                                            <option value="Other">Other</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Qty</label>
                                                                        <input type="number" value={stone.quantity ?? 1} min={1}
                                                                            onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], quantity: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Weight (ct)</label>
                                                                        <input type="number" value={stone.weight ?? 0} min={0}
                                                                            onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], weight: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Mode</label>
                                                                        <select
                                                                            value={stone.pricingMode || 'total'}
                                                                            onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], pricingMode: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                        >
                                                                            <option value="total">Total</option>
                                                                            <option value="per_carat">Per Carat</option>
                                                                        </select>
                                                                    </div>
                                                                    {stone.pricingMode === 'per_carat' ? (
                                                                        <div className="space-y-1">
                                                                            <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">₹ / Carat</label>
                                                                            <input type="number" value={stone.pricePerCarat ?? 0} min={0}
                                                                                onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], pricePerCarat: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                                disabled={isViewMode}
                                                                                className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-1">
                                                                            <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Total Price (₹)</label>
                                                                            <input type="number" value={stone.totalPrice ?? 0} min={0}
                                                                                onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], totalPrice: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                                disabled={isViewMode}
                                                                                className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-purple-600 uppercase tracking-widest">Cert. Charge</label>
                                                                        <input type="number" value={stone.certificateCharge ?? 0} min={0}
                                                                            onChange={(e) => { const s = [...(v.gemstonePricing || [])]; s[stoneIdx] = { ...s[stoneIdx], certificateCharge: e.target.value }; handleVariantChange(v.id, 'gemstonePricing', s); }}
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-white border border-purple-200 rounded-lg py-2 px-2 text-xs font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 flex justify-end">
                                                                    <div className="bg-purple-100/70 rounded-lg px-3 py-1.5 text-[10px] font-black text-purple-800">
                                                                        {stone.gemstoneType} = ₹{stonePrice}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div className="flex justify-end">
                                                        <div className="bg-purple-700 rounded-xl px-4 py-2 text-xs font-black text-white">
                                                            Total Gemstone Value: ₹{pricing.gemstonePrice.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Variant Media & FAQs */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Variant Media</h4>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">Custom overrides</span>
                                            </div>
                                            <div className="bg-gray-50 rounded-3xl p-4 sm:p-6 border border-gray-100 space-y-4">
                                                <div className="flex flex-col gap-3">
                                                    {!isViewMode && (
                                                        <label className="px-5 py-3 self-start bg-white border border-gray-200 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-700 hover:border-[#3E2723] hover:text-[#3E2723] transition-all cursor-pointer shadow-sm">
                                                            <div className="flex items-center gap-2">
                                                                <ImagePlus size={14} /> Upload Images
                                                            </div>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleVariantImageUpload(v.id, e.target.files)}
                                                            />
                                                        </label>
                                                    )}
                                                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 w-fit">
                                                        ✨ Recommended Size: 1080x1080px (1:1 Ratio)
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-3">
                                                    {/* Upload Previews */}
                                                    {(variantImagePreviews[v.id] || []).map((img, previewIdx) => (
                                                        <div key={`${v.id}-upload-${previewIdx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-white shadow-md ring-1 ring-black/5">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                            {!isViewMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveVariantUpload(v.id, previewIdx)}
                                                                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-sm"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {/* Saved Images */}
                                                    {Array.isArray(v.variantImages) && v.variantImages.map((img, imageIdx) => (
                                                        <div key={`${v.id}-saved-${imageIdx}`} className="relative aspect-square rounded-2xl overflow-hidden border border-white shadow-md ring-1 ring-black/5">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                            {!isViewMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSavedVariantImage(v.id, img)}
                                                                    className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-sm"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {(!v.variantImages || v.variantImages.length === 0) && (!variantImagePreviews[v.id] || variantImagePreviews[v.id].length === 0) && (
                                                    <div className="text-center py-4">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                                            Using product-level gallery<br/>(Fallback Active)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Variant FAQs</h4>
                                                {!isViewMode && (
                                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-700 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={Array.isArray(v.variantFaqs) && v.variantFaqs.length > 0}
                                                            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                            onChange={(e) => {
                                                                if (e.target.checked) addVariantFaq(v.id);
                                                                else clearVariantFaqOverride(v.id);
                                                            }}
                                                        />
                                                        Custom FAQ Override
                                                    </label>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                {(v.variantFaqs || []).length > 0 ? (
                                                    <div className="space-y-3">
                                                        {(v.variantFaqs || []).map((faq, faqIndex) => (
                                                            <div key={`${v.id}-faq-${faqIndex}`} className="p-5 rounded-3xl bg-white border border-gray-100 relative group shadow-sm">
                                                                <div className="space-y-3">
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Question</label>
                                                                        <input
                                                                            value={faq.question}
                                                                            onChange={(e) => handleVariantFaqChange(v.id, faqIndex, 'question', e.target.value)}
                                                                            placeholder="e.g. Is this variant heavier?"
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-gray-50 border border-gray-50 rounded-xl py-2 px-3 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-amber-200 transition-all"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Answer</label>
                                                                        <textarea
                                                                            value={faq.answer}
                                                                            onChange={(e) => handleVariantFaqChange(v.id, faqIndex, 'answer', e.target.value)}
                                                                            placeholder="Explain difference."
                                                                            disabled={isViewMode}
                                                                            className="w-full bg-gray-50 border border-gray-50 rounded-xl py-2 px-3 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-amber-200 transition-all"
                                                                            rows={2}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {!isViewMode && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeVariantFaq(v.id, faqIndex)}
                                                                        className="absolute -top-1 -right-1 h-6 w-6 bg-white text-gray-400 hover:text-red-500 border border-gray-100 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {!isViewMode && (
                                                            <button
                                                                type="button"
                                                                onClick={() => addVariantFaq(v.id)}
                                                                className="flex items-center gap-2 text-[9px] font-black text-[#3E2723] uppercase tracking-widest hover:underline"
                                                            >
                                                                <Plus size={12} /> Add Override FAQ
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="py-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Inheriting global product FAQs</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductVariantsTab;
