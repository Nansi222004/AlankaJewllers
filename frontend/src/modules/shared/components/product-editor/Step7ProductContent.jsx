import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    HelpCircle, Plus, Trash2, X, MessageSquare, Info,
    Sparkles, Zap, TrendingUp, Heart, Star, Gem, Search
} from 'lucide-react';
import { FormSection, Input } from '../../../admin/components/common/FormControls';
import { quillModules, quillFormats } from '../../utils/productEditorUtils';
import api from '../../../../services/api';

const Step7ProductContent = ({
    formData,
    setFormData,
    errors = {},
    isViewMode,
    addFaq,
    removeFaq,
    handleFaqChange,
    addVariantFaq,
    removeVariantFaq,
    handleVariantFaqChange,
    clearVariantFaqOverride,
    activeVariantIndex = 0
}) => {
    const variants = formData.variants || [];
    const currentVariant = variants[activeVariantIndex] || variants[0] || {};
    const hasVariantOverride = Array.isArray(currentVariant.variantFaqs) && currentVariant.variantFaqs.length > 0;

    // Related Products state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [resolvedProducts, setResolvedProducts] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Resolve existing related products
    useEffect(() => {
        const ids = formData.relatedProducts || [];
        if (ids.length === 0) {
            setResolvedProducts([]);
            return;
        }
        const resolve = async () => {
            try {
                const res = await api.get('public/products/by-ids', {
                    params: { ids: ids.join(',') }
                });
                const fetched = res.data?.data?.products || res.data?.products || [];
                setResolvedProducts(fetched);
            } catch {
                // fallback
            }
        };
        resolve();
    }, [formData.relatedProducts]);

    // Search query with debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get('public/products', {
                    params: { search: searchTerm, limit: 6 }
                });
                const list = res.data?.data?.products || res.data?.products || [];
                const currentId = formData._id || formData.id;
                const selected = formData.relatedProducts || [];
                setSearchResults(list.filter(p => p._id !== currentId && !selected.includes(p._id)));
            } catch {
                // fallback
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, formData.relatedProducts, formData._id, formData.id]);

    const handleAddRelated = (product) => {
        const cur = formData.relatedProducts || [];
        if (cur.includes(product._id)) return;
        setFormData(prev => ({
            ...prev,
            relatedProducts: [...cur, product._id]
        }));
        setResolvedProducts(prev => [...prev, product]);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveRelated = (id) => {
        setFormData(prev => ({
            ...prev,
            relatedProducts: (prev.relatedProducts || []).filter(item => item !== id)
        }));
        setResolvedProducts(prev => prev.filter(p => p._id !== id));
    };

    const marketingTags = [
        { label: 'New Arrival', key: 'isNewArrival', icon: <Zap size={13} className="text-emerald-500" /> },
        { label: 'Trending', key: 'isTrending', icon: <TrendingUp size={13} className="text-blue-500" /> },
        { label: 'Most Gifted', key: 'isMostGifted', icon: <Heart size={13} className="text-pink-500" /> },
        { label: 'New Launch', key: 'isNewLaunch', icon: <Star size={13} className="text-amber-500" /> },
        { label: 'Premium Collection', key: 'isPremium', icon: <Gem size={13} className="text-purple-500" /> }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        07
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Atelier Narrative & FAQ Protocol</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Editorial storytelling, artisan care guide, and global vs variant question hierarchies</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 7 of 8
                    </span>
                </div>
            </div>

            {/* Narrative Editorial Sections */}
            <FormSection title="Editorial Narrative & Specifications">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Product Description <span className="text-red-500">*</span>
                        </label>
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                            <ReactQuill
                                theme="snow"
                                value={formData.description || ''}
                                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                readOnly={isViewMode}
                                modules={quillModules}
                                formats={quillFormats}
                                style={{ height: '200px', marginBottom: '45px' }}
                            />
                        </div>
                        {errors.description && <span className="text-xs text-red-500 font-medium mt-1 block">{errors.description}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Technical Specifications <span className="text-gray-400 font-normal">(Dimensions, Motifs, Closure)</span>
                        </label>
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                            <ReactQuill
                                theme="snow"
                                value={formData.specifications || ''}
                                onChange={(val) => setFormData(prev => ({ ...prev, specifications: val }))}
                                readOnly={isViewMode}
                                modules={quillModules}
                                formats={quillFormats}
                                style={{ height: '140px', marginBottom: '45px' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Styling Protocol & Inspirations
                            </label>
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.stylingTips || ''}
                                    onChange={(val) => setFormData(prev => ({ ...prev, stylingTips: val }))}
                                    readOnly={isViewMode}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ height: '140px', marginBottom: '45px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-gray-700">
                                    Jewellery Care Protocol
                                </label>
                                {!isViewMode && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            careTips: "<p><strong>Alankar Jewellers Care Guide:</strong></p><ul><li>Avoid direct contact with perfumes, deodorants, and cosmetic lotions.</li><li>Remove fine jewellery before swimming, exercise, or household cleaning.</li><li>Store individually in an airtight pouch or satin-lined jewellery case.</li><li>Wipe gently with a soft micro-suede polishing cloth after each wear.</li></ul>"
                                        }))}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Load Care Template
                                    </button>
                                )}
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.careTips || ''}
                                    onChange={(val) => setFormData(prev => ({ ...prev, careTips: val }))}
                                    readOnly={isViewMode}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ height: '140px', marginBottom: '45px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* FAQ Architecture Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Product FAQs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={16} className="text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900">Global Product FAQs</h3>
                        </div>
                        {!isViewMode && (
                            <button
                                type="button"
                                onClick={addFaq}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1"
                            >
                                <Plus size={12} /> Add FAQ
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500">Inherited by all variants automatically unless overridden.</p>

                    <div className="space-y-3">
                        {(formData.faqs || []).map((faq, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs space-y-2 relative group">
                                <input
                                    type="text"
                                    value={faq.question || ''}
                                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                                    placeholder="e.g. Is this piece hallmarked with BIS standards?"
                                    disabled={isViewMode}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 text-xs font-semibold text-gray-900 outline-none focus:bg-white"
                                />
                                <textarea
                                    rows={2}
                                    value={faq.answer || ''}
                                    onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                                    placeholder="e.g. Yes, each genuine piece is independently assayed and hallmarked."
                                    disabled={isViewMode}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 text-xs text-gray-700 outline-none focus:bg-white"
                                />
                                {!isViewMode && (
                                    <button
                                        type="button"
                                        onClick={() => removeFaq(idx)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {(!formData.faqs || formData.faqs.length === 0) && (
                            <div className="py-8 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center p-4">
                                <MessageSquare size={20} className="text-gray-300 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-gray-500">No Global FAQs Configured</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Click "+ Add FAQ" above to enter common customer questions.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Variant FAQ Overrides */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-700" />
                            <h3 className="text-sm font-bold text-gray-900">
                                Variant FAQ Override ({currentVariant.name || 'Standard'})
                            </h3>
                        </div>

                        {!isViewMode && (
                            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasVariantOverride}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            addVariantFaq(currentVariant.id);
                                        } else {
                                            clearVariantFaqOverride(currentVariant.id);
                                        }
                                    }}
                                    className="rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                                />
                                Enable Override
                            </label>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-500">
                        When enabled, replaces the Global FAQs with tailored questions for this specific variant.
                    </p>

                    <div className="space-y-3">
                        {hasVariantOverride ? (
                            <>
                                {(currentVariant.variantFaqs || []).map((faq, fIdx) => (
                                    <div key={fIdx} className="p-4 rounded-xl bg-white border border-amber-200/70 shadow-xs space-y-2 relative group">
                                        <input
                                            type="text"
                                            value={faq.question || ''}
                                            onChange={(e) => handleVariantFaqChange(currentVariant.id, fIdx, 'question', e.target.value)}
                                            placeholder="e.g. Can this specific size be resized later?"
                                            disabled={isViewMode}
                                            className="w-full bg-amber-50/40 border border-amber-100 rounded-lg py-1.5 px-3 text-xs font-semibold text-gray-900 outline-none focus:bg-white"
                                        />
                                        <textarea
                                            rows={2}
                                            value={faq.answer || ''}
                                            onChange={(e) => handleVariantFaqChange(currentVariant.id, fIdx, 'answer', e.target.value)}
                                            placeholder="e.g. This size can be resized by up to 2 numbers."
                                            disabled={isViewMode}
                                            className="w-full bg-amber-50/40 border border-amber-100 rounded-lg py-1.5 px-3 text-xs text-gray-700 outline-none focus:bg-white"
                                        />
                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                onClick={() => removeVariantFaq(currentVariant.id, fIdx)}
                                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {!isViewMode && (
                                    <button
                                        type="button"
                                        onClick={() => addVariantFaq(currentVariant.id)}
                                        className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add Override FAQ
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="py-8 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center p-4">
                                <p className="text-xs font-semibold text-gray-600">Inheriting Global FAQs</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Toggle "Enable Override" above if this variant requires unique answers.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Marketing Attributes & Related Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FormSection title="Curated Marketing Badges">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {marketingTags.map((tag) => {
                            const isChecked = Boolean(formData.tags?.[tag.key]);
                            return (
                                <label
                                    key={tag.key}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-amber-50 border-amber-300 shadow-xs' : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                            {tag.icon}
                                        </div>
                                        <span className={`text-xs font-bold ${isChecked ? 'text-amber-900' : 'text-gray-700'}`}>
                                            {tag.label}
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            tags: { ...(prev.tags || {}), [tag.key]: e.target.checked }
                                        }))}
                                        disabled={isViewMode}
                                        className="rounded border-gray-300 text-amber-700 focus:ring-amber-500"
                                    />
                                </label>
                            );
                        })}
                    </div>
                </FormSection>

                <FormSection title="Related Jewellery Pairings">
                    <div className="space-y-4">
                        <div className="relative" ref={dropdownRef}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search products to attach as recommended pairings..."
                                disabled={isViewMode}
                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 pr-20 text-xs font-semibold text-gray-900 outline-none focus:border-[#3E2723]"
                            />
                            {searching && (
                                <span className="absolute right-3 top-2.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                    Searching...
                                </span>
                            )}

                            {showDropdown && searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-gray-100">
                                    {searchResults.map(p => (
                                        <div
                                            key={p._id}
                                            onClick={() => handleAddRelated(p)}
                                            className="p-3 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                        >
                                            <span className="font-semibold text-gray-800">{p.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">₹{p.price || p.mrp || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Related List */}
                        <div className="flex flex-wrap gap-2">
                            {resolvedProducts.map(p => (
                                <span
                                    key={p._id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200"
                                >
                                    <span>{p.name}</span>
                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRelated(p._id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </FormSection>
            </div>
        </div>
    );
};

export default Step7ProductContent;
