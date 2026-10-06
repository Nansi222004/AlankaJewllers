import React from 'react';
import { Barcode as BarcodeIcon, Download, Copy, ShieldCheck, Info, CheckCircle2, Tag } from 'lucide-react';
import Barcode from 'react-barcode';
import { FormSection } from '../../../admin/components/common/FormControls';
import toast from 'react-hot-toast';

const Step5ProductBarcode = ({
    formData,
    handleDownloadSerialBarcode,
    handleDownloadAllSerialBarcodes,
    setSerialBarcodeRef,
    activeVariantIndex = 0,
    setActiveVariantIndex
}) => {
    const variants = formData.variants || [];
    const currentVariant = variants[activeVariantIndex] || variants[0] || {};
    const serialCodes = currentVariant.serialCodes || [];

    const handleCopyCode = (code) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        toast.success(`Copied: ${code}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        05
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Product Identity & Barcode Tracking</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Physical tagging, vault scanning, dispatch manifests, and tamper-evident void seals</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 5 of 8
                    </span>
                </div>
            </div>

            {/* Clarification Callout matching prompt */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
                <Info size={16} className="text-amber-700 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <p className="font-bold">Physical Tag & Barcode Protocol Explanation</p>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        Used to uniquely identify this product and its variants for inventory management, physical tagging, barcode scanning, order packing, and customer returns.
                    </p>
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
                            <span className="opacity-75 text-[10px] ml-1.5">({v.variantCode || 'Pending'})</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 5 Columns: Variant Reference & Void Tag Protocol */}
                <div className="lg:col-span-5 space-y-6">
                    <FormSection title="Catalogue Reference Code">
                        <div className="space-y-5">
                            <div className="p-6 rounded-2xl bg-[#FDFBF7] border border-amber-200/60 flex flex-col items-center justify-center text-center shadow-inner">
                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1.5">Variant Reference Code</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-mono font-black text-gray-900 tracking-wider">
                                        {currentVariant.variantCode || formData.productCode || 'GENERATING ON SAVE'}
                                    </span>
                                    {(currentVariant.variantCode || formData.productCode) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopyCode(currentVariant.variantCode || formData.productCode)}
                                            className="p-2 bg-white rounded-lg border border-amber-200 text-amber-700 hover:bg-[#3E2723] hover:text-white transition-all shadow-xs"
                                            title="Copy Code"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-2 font-medium">Uniquely identifies this variant in database & SKU records</span>
                            </div>

                            {/* Void Tag ID / Security Seal Relationship Card */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-slate-900">
                                    <ShieldCheck size={16} className="text-slate-700" />
                                    <span>VOID TAG ID & Security Seal Protocol</span>
                                </div>
                                <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                                    <p>
                                        • <strong>Product Reference:</strong> Identifies the catalogue model & variant specifications.
                                    </p>
                                    <p>
                                        • <strong>Physical Tag Serial #:</strong> Identifies the tamper-evident security seal affixed to the physical jewellery piece. Entered during order packing and verified during returns.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FormSection>
                </div>

                {/* Right 7 Columns: Barcode Generator & Batch Export */}
                <div className="lg:col-span-7 space-y-6">
                    <FormSection title="Visual Barcode Signatures">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-medium">
                                    Scannable barcodes for physical warehouse inventory and jewellery tags.
                                </p>
                                {serialCodes.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleDownloadAllSerialBarcodes(currentVariant)}
                                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Download size={13} /> Batch Export ({serialCodes.length} units)
                                    </button>
                                )}
                            </div>

                            {serialCodes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                                    {serialCodes.map((codeObj, cIdx) => (
                                        <div 
                                            key={cIdx}
                                            className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs flex flex-col items-center gap-3 relative group"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[10px] font-mono font-bold text-gray-500">{codeObj.code}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadSerialBarcode(codeObj.code)}
                                                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-[#3E2723] transition-colors"
                                                    title="Download SVG"
                                                >
                                                    <Download size={13} />
                                                </button>
                                            </div>

                                            <div 
                                                className="bg-[#FDFBF7] p-2.5 rounded-lg border border-[#EFEBE9] w-full flex justify-center"
                                                ref={(node) => setSerialBarcodeRef(codeObj.code, node)}
                                            >
                                                <Barcode
                                                    value={codeObj.code}
                                                    width={1.2}
                                                    height={36}
                                                    fontSize={9}
                                                    background="#FDFBF7"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 bg-gray-50/70 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                                    <BarcodeIcon size={28} className="text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-600">No Barcodes Available</p>
                                    <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                                        Allocate stock in Step 4 to generate scannable barcodes for physical jewellery tags.
                                    </p>
                                </div>
                            )}
                        </div>
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default Step5ProductBarcode;
