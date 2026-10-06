import React, { useMemo, useState } from 'react';
import { Tag, Search, X, Info, Layers, CheckCircle2 } from 'lucide-react';
import { FormSection, Input, Select } from '../../../admin/components/common/FormControls';

const Step1ProductIdentity = ({
    formData,
    setFormData,
    errors = {},
    categories = [],
    isViewMode,
    handleCategoryChange
}) => {
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    const filteredCategories = useMemo(() => {
        return (categories || []).filter(cat =>
            cat && String(cat.name || '').toLowerCase().includes(categorySearchQuery.toLowerCase())
        );
    }, [categories, categorySearchQuery]);

    const audienceOptions = [
        { key: 'unisex', label: 'Unisex' },
        { key: 'women', label: 'Women' },
        { key: 'men', label: 'Men' },
        { key: 'family', label: 'Family' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        01
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Product Identity</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Define core catalogue identification, department classification and target audience</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 1 of 8
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Core Identity Section */}
                <FormSection title="Catalogue Nomenclature">
                    <div className="space-y-5">
                        <div>
                            <Input
                                label={<span>Product Name <span className="text-red-500">*</span></span>}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Royal Heritage Floral Gold Necklace"
                                disabled={isViewMode}
                                error={errors.name}
                            />
                            <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                                <Info size={12} className="text-amber-600 shrink-0" />
                                Enter the official customer-facing product name displayed across store and invoices.
                            </p>
                        </div>

                        {/* Category Selection with Instant Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Primary Category <span className="text-red-500">*</span>
                            </label>

                            {!isViewMode && (
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={categorySearchQuery}
                                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                                        placeholder="Type to filter categories (e.g. Rings, Necklaces)..."
                                        className="w-full bg-gray-50/70 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-xs font-normal text-gray-800 outline-none focus:bg-white focus:border-[#3E2723] focus:ring-4 focus:ring-[#3E2723]/5 transition-all shadow-xs"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3E2723] transition-colors">
                                        <Search size={14} />
                                    </div>
                                    {categorySearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setCategorySearchQuery('')}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 bg-gray-200/60 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <select
                                value={formData.categories?.[0]?.category || ''}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={`w-full bg-white border rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 transition-all shadow-xs ${errors.categories ? 'border-red-300 focus:border-red-400 focus:ring-red-200/40' : 'border-gray-200 focus:border-[#3E2723] focus:ring-[#3E2723]/10'}`}
                                disabled={isViewMode}
                            >
                                <option value="">
                                    {categorySearchQuery ? `Matching Categories (${filteredCategories.length})` : 'Select Jewellery Category'}
                                </option>
                                {filteredCategories.map(cat => (
                                    <option key={cat._id} value={cat._id} disabled={cat.isActive === false}>
                                        {cat.name}{cat.isActive === false ? ' (Inactive)' : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.categories && <span className="text-xs text-red-500 mt-1 block">{errors.categories}</span>}
                            <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                                <Info size={12} className="text-amber-600 shrink-0" />
                                Select the primary jewellery category for breadcrumb navigation and store indexing.
                            </p>
                        </div>
                    </div>
                </FormSection>

                {/* Audience & Store Badges */}
                <div className="space-y-6">
                    <FormSection title="Audience & Department">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Target Customer Audience
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {audienceOptions.map(({ key, label }) => {
                                    const isSelected = Array.isArray(formData.audience) && formData.audience.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            disabled={isViewMode}
                                            onClick={() => {
                                                const next = new Set(Array.isArray(formData.audience) ? formData.audience : []);
                                                if (isSelected) {
                                                    next.delete(key);
                                                } else {
                                                    next.add(key);
                                                }
                                                const list = Array.from(next);
                                                setFormData({ ...formData, audience: list.length > 0 ? list : ['unisex'] });
                                            }}
                                            className={`py-3 px-4 rounded-xl border text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                                                isSelected 
                                                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-sm' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {isSelected && <CheckCircle2 size={13} className="text-amber-300" />}
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                                <Info size={12} className="text-amber-600 mt-0.5 shrink-0" />
                                Enables discovery within Women's, Men's, or Family Gift collections. Default is Unisex.
                            </p>
                        </div>
                    </FormSection>

                    <FormSection title="Store Merchandising Badges">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Card Badge Label"
                                    value={formData.cardLabel || ''}
                                    onChange={(e) => setFormData({ ...formData, cardLabel: e.target.value })}
                                    disabled={isViewMode}
                                    placeholder="e.g. Bestseller, Rare Find"
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Shown on product thumbnail cards.</span>
                            </div>
                            <div>
                                <Input
                                    label="Promo Ribbon Badge"
                                    value={formData.cardBadge || ''}
                                    onChange={(e) => setFormData({ ...formData, cardBadge: e.target.value })}
                                    disabled={isViewMode}
                                    placeholder="e.g. Wedding Edit, Limited Edition"
                                />
                                <span className="text-[10px] text-gray-400 mt-1 block">Upper corner ribbon accent on listing.</span>
                            </div>
                        </div>
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default Step1ProductIdentity;
