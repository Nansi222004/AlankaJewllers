import React from 'react';
import { 
    CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
    Send, Loader2, Sparkles, Scale, IndianRupee, Layers, 
    Image as ImageIcon, Check, ArrowRight 
} from 'lucide-react';
import { FormSection } from '../../../admin/components/common/FormControls';
import { getPricingForVariant } from '../../utils/productEditorUtils';

const Step8ProductReview = ({
    formData,
    setFormData,
    isViewMode,
    isSaving,
    handleSubmit,
    metalRates = {},
    gstRate = 3,
    previewImages = [],
    setActiveTab,
    isEditMode
}) => {
    const variants = formData.variants || [];
    const primaryVariant = variants[0] || {};
    const pricing = getPricingForVariant(primaryVariant, formData, metalRates, gstRate);

    // Validation checks
    const hasName = Boolean(formData.name && formData.name.trim());
    const hasCategory = Boolean(formData.categories?.[0]?.category);
    const hasMaterial = Boolean(formData.material);
    const hasPurity = formData.material === 'Gold' 
        ? Boolean(formData.goldCategory) 
        : formData.material === 'Silver' 
            ? Boolean(formData.silverCategory) 
            : ['Diamond', 'Gems'].includes(formData.material)
                ? Boolean(formData.settingPurity)
                : true;
    const hasWeight = Number(primaryVariant.weight) > 0;
    const hasStock = Number(primaryVariant.stock) > 0;
    const hasImages = previewImages.length > 0;
    const hasImageConfirmed = Boolean(formData.imageIntegrityConfirmed);
    const hasValidPrice = Number(pricing.finalPrice) > 0;
    const hasDocsConfirmed = (formData.material === 'Diamond' || ['Ruby', 'Emerald', 'Sapphire'].includes(formData.gemstoneType))
        ? Boolean(formData.sourceDocumentationConfirmed)
        : true;

    const allPassed = hasName && hasCategory && hasMaterial && hasPurity && hasWeight && hasStock && hasImages && hasImageConfirmed && hasValidPrice && hasDocsConfirmed;

    const checklistItems = [
        { label: 'Product Name', passed: hasName, step: 'identity', desc: formData.name || 'Missing name' },
        { label: 'Category Assigned', passed: hasCategory, step: 'identity', desc: hasCategory ? 'Category linked' : 'No category selected' },
        { label: 'Material & Purity Standard', passed: hasMaterial && hasPurity, step: 'material', desc: `${formData.material || 'None'} • ${formData.goldCategory ? `${formData.goldCategory}K` : formData.silverCategory || formData.settingPurity || 'Configured'}` },
        { label: 'Precious Metal Weight', passed: hasWeight, step: 'pricing', desc: `${primaryVariant.weight || 0} ${primaryVariant.weightUnit || 'Grams'}` },
        { label: 'Vault Inventory Stock', passed: hasStock, step: 'inventory', desc: `${primaryVariant.stock || 0} live units ready` },
        { label: 'Product Photography', passed: hasImages, step: 'media', desc: `${previewImages.length} photo(s) uploaded` },
        { label: 'Image Integrity Certified', passed: hasImageConfirmed, step: 'media', desc: hasImageConfirmed ? 'Confirmed genuine product' : 'Confirmation required' },
        { label: 'Zero-Price Protection Check', passed: hasValidPrice, step: 'pricing', desc: hasValidPrice ? `₹${pricing.finalPrice.toLocaleString('en-IN')}` : 'Price is ₹0 (Unavailable)' },
        { label: 'Source Documentation', passed: hasDocsConfirmed, step: 'material', desc: hasDocsConfirmed ? 'Documented claims confirmed' : 'Requires verification' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        08
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Review & Publication Protocol</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Pre-publication compliance audit, final commercial invoice breakdown, and catalog commit</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 8 of 8
                    </span>
                </div>
            </div>

            {/* Zero Price Critical Guard Banner */}
            {!hasValidPrice && (
                <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={22} className="text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold text-red-900">PRICE UNAVAILABLE — ZERO PRICE PROTECTION ACTIVE</h3>
                            <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                                Please configure a valid metal rate, precious weight, or stone pricing before publishing this product. A commercial sellable product can never be published or purchased at ₹0.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActiveTab('pricing')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                    >
                        Configure Pricing <ArrowRight size={13} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 6 Columns: Publication Readiness Checklist */}
                <div className="lg:col-span-6 space-y-6">
                    <FormSection title={`Catalogue Readiness Checklist ${allPassed ? '(100% Compliant)' : '(Action Required)'}`}>
                        <div className="space-y-3">
                            {checklistItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                        item.passed 
                                            ? 'bg-emerald-50/40 border-emerald-200/60 text-emerald-950' 
                                            : 'bg-red-50/40 border-red-200/60 text-red-950'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.passed ? (
                                            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                                        ) : (
                                            <XCircle size={18} className="text-red-500 shrink-0" />
                                        )}
                                        <div>
                                            <span className="text-xs font-bold block">{item.label}</span>
                                            <span className={`text-[10px] ${item.passed ? 'text-emerald-700/80' : 'text-red-700/80'}`}>
                                                {item.desc}
                                            </span>
                                        </div>
                                    </div>

                                    {!item.passed && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(item.step)}
                                            className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1"
                                        >
                                            Fix <ArrowRight size={11} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </FormSection>

                    {/* Publication Status & Visibility Controls */}
                    <FormSection title="Publishing Status & Visibility">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Publication Lifecycle State
                                </label>
                                <select
                                    value={formData.status || 'Active'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    disabled={isViewMode}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-xs font-bold text-gray-900 outline-none focus:border-[#3E2723]"
                                >
                                    <option value="Active">Active (Published & Discoverable Online)</option>
                                    <option value="Draft">Draft (Internal Staging Only)</option>
                                    <option value="Archived">Archived (Retired Catalogue)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(formData.showInNavbar ?? true)}
                                        onChange={(e) => setFormData({ ...formData, showInNavbar: e.target.checked })}
                                        disabled={isViewMode}
                                        className="rounded border-gray-300 text-amber-700 focus:ring-amber-500"
                                    />
                                    <span>Show in Navbar Menus</span>
                                </label>

                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(formData.showInCollection ?? true)}
                                        onChange={(e) => setFormData({ ...formData, showInCollection: e.target.checked })}
                                        disabled={isViewMode}
                                        className="rounded border-gray-300 text-amber-700 focus:ring-amber-500"
                                    />
                                    <span>Show in Store Grid</span>
                                </label>
                            </div>
                        </div>
                    </FormSection>
                </div>

                {/* Right 6 Columns: Itemized Commercial Breakdown & Publish CTA */}
                <div className="lg:col-span-6 space-y-6">
                    <FormSection title="Final Commercial Breakdown (Primary Variant)">
                        <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-amber-200/60 shadow-inner space-y-4">
                            <div className="space-y-2.5 font-mono text-xs">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>METAL VALUE</span>
                                    <span className="font-bold text-gray-900">₹{pricing.metalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>MAKING CHARGES</span>
                                    <span className="font-bold text-gray-900">₹{pricing.makingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>DIAMOND</span>
                                    <span className={pricing.diamondPrice > 0 ? 'font-bold text-pink-700' : 'text-gray-400'}>
                                        {pricing.diamondPrice > 0 ? `₹${pricing.diamondPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not applicable'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>GEMSTONE</span>
                                    <span className={pricing.gemstonePrice > 0 ? 'font-bold text-purple-700' : 'text-gray-400'}>
                                        {pricing.gemstonePrice > 0 ? `₹${pricing.gemstonePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not applicable'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>HALLMARKING</span>
                                    <span className={pricing.hallmarkingCharge > 0 ? 'font-bold text-gray-900' : 'text-gray-400'}>
                                        {pricing.hallmarkingCharge > 0 ? `₹${pricing.hallmarkingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not applicable'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>CERTIFICATE</span>
                                    <span className={(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge) > 0 ? 'font-bold text-gray-900' : 'text-gray-400'}>
                                        {(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge) > 0 
                                            ? `₹${(pricing.diamondCertificateCharge + pricing.gemstoneCertificateCharge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                                            : 'Not applicable'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-gray-600">
                                    <span>ADDITIONAL</span>
                                    <span className={pricing.additionalCharge > 0 ? 'font-bold text-gray-900' : 'text-gray-400'}>
                                        {pricing.additionalCharge > 0 ? `₹${pricing.additionalCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not applicable'}
                                    </span>
                                </div>

                                <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between items-center font-bold text-gray-800">
                                    <span>TAXABLE SUBTOTAL</span>
                                    <span>₹{pricing.subtotalBeforeTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center text-gray-700">
                                    <span>GST ({gstRate}%)</span>
                                    <span className="font-semibold">₹{pricing.gstValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center text-gray-700">
                                    <span>PG CHARGE ({pricing.pgChargePercent}%)</span>
                                    <span className="font-semibold">
                                        {pricing.pgChargeAmount > 0 
                                            ? `₹${pricing.pgChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                                            : '₹0.00 (Store Absorbed)'}
                                    </span>
                                </div>

                                <div className="border-t-2 border-amber-300 pt-3 flex justify-between items-center text-sm font-extrabold text-amber-950">
                                    <span>FINAL CUSTOMER PRICE</span>
                                    <span className="text-lg">₹{pricing.finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Commit Action Button */}
                        {!isViewMode && (
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving || !hasValidPrice}
                                    className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2.5 ${
                                        !hasValidPrice
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                            : 'bg-[#3E2723] hover:bg-black text-white hover:shadow-lg active:scale-98'
                                    }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Committing to Registry...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>{isEditMode ? 'Update Product Manifest' : 'Commit & Publish Product'}</span>
                                        </>
                                    )}
                                </button>
                                {!hasValidPrice && (
                                    <p className="text-[10px] text-center text-red-600 mt-2 font-medium">
                                        Publish button disabled: Final price must be greater than ₹0.
                                    </p>
                                )}
                            </div>
                        )}
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default Step8ProductReview;
