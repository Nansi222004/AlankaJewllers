import React from 'react';
import {
    Coins, Sparkles, ShieldCheck, Info, CheckCircle2,
    FileText, AlertTriangle
} from 'lucide-react';
import { FormSection, Input, Select } from '../../../admin/components/common/FormControls';
import AlankarJewelleryMark from '../AlankarJewelleryMark';

const Step2ProductMaterial = ({
    formData,
    setFormData,
    errors = {},
    isViewMode
}) => {
    const materialOptions = [
        { label: 'Gold (Genuine Precious Metal)', value: 'Gold' },
        { label: 'Silver (Genuine Precious Metal)', value: 'Silver' },
        { label: 'Diamond (Precious Solitaire / Pave)', value: 'Diamond' },
        { label: 'Gems (Precious / Semi-Precious Stones)', value: 'Gems' },
        { label: 'Other (Fashion / Plated Alloy / Brass)', value: 'Other' }
    ];

    const silverPurityOptions = [
        { label: 'Select Silver Purity', value: '' },
        { label: '925 Sterling Silver (Standard Hallmarked)', value: '925 sterling silver' },
        { label: '999 Fine Silver (Pure Silver Coin/Bar)', value: '999' },
        { label: '925 Silver', value: '925' },
        { label: '970 Silver', value: '970' },
        { label: '958 Silver', value: '958' },
        { label: '835 Silver', value: '835' },
        { label: '800 Silver', value: '800' }
    ];

    const goldPurityOptions = [
        { label: 'Select Karat Purity', value: '' },
        { label: '24 Karat (99.9% Pure Gold)', value: '24' },
        { label: '22 Karat (91.6% BIS Hallmarked)', value: '22' },
        { label: '18 Karat (75.0% Fine Jewellery)', value: '18' },
        { label: '14 Karat (58.5% Everyday Luxury)', value: '14' }
    ];

    const goldToneOptions = [
        { label: 'Select Gold Finish Tone', value: '' },
        { label: 'Yellow Gold (Classic Warm Luster)', value: 'Yellow Gold' },
        { label: 'Rose Gold (Romantic Pink Blush)', value: 'Rose Gold' },
        { label: 'White Gold (Modern Rhodium Luster)', value: 'White Gold' }
    ];

    const gemstoneTypeOptions = [
        { label: 'Select Gemstone Classification', value: '' },
        { label: 'Ruby (Source-Verified Corundum)', value: 'Ruby' },
        { label: 'Emerald (Source-Verified Beryl)', value: 'Emerald' },
        { label: 'Sapphire (Source-Verified Corundum)', value: 'Sapphire' },
        { label: 'Pearl (Natural / Cultured Organic)', value: 'Pearl' },
        { label: 'Kundan (Traditional Foil Set Glass/Stone)', value: 'Kundan' },
        { label: 'Decorative / Imitation Stone', value: 'Decorative / Imitation Stone' },
        { label: 'Mixed Gemstones', value: 'Mixed Gemstones' },
        { label: 'Other Gemstone', value: 'Other' }
    ];

    const handleMaterialSelect = (material) => {
        setFormData(prev => ({
            ...prev,
            material,
            goldCategory: material === 'Gold' ? prev.goldCategory : '',
            goldTone: material === 'Gold' ? prev.goldTone : '',
            silverCategory: material === 'Silver' ? prev.silverCategory : '',
            diamondType: material === 'Diamond' ? (prev.diamondType !== 'none' ? prev.diamondType : 'natural') : 'none',
            settingMetal: ['Diamond', 'Gems'].includes(material) ? (prev.settingMetal || 'Gold') : '',
            settingPurity: ['Diamond', 'Gems'].includes(material) ? (prev.settingPurity || '18K') : '',
            gemstoneType: material === 'Gems' ? prev.gemstoneType : '',
            gemstones: material === 'Gems' ? prev.gemstones : [],
            sourceDocumentationConfirmed: false,
            variants: (prev.variants || []).map(v => ({
                ...v,
                diamondType: material === 'Diamond' ? (v.diamondType !== 'none' ? v.diamondType : 'natural') : 'none'
            }))
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        02
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Material & Authentication Protocol</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Configure genuine metallurgical classification, assay purity standards, and legal compliance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 2 of 8
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Primary Material Selection Card */}
                <FormSection title="Primary Precious Classification">
                    <div className="space-y-5">
                        <Select
                            label={<span>Primary Material <span className="text-red-500">*</span></span>}
                            value={formData.material || 'Gold'}
                            onChange={(e) => handleMaterialSelect(e.target.value)}
                            options={materialOptions}
                            disabled={isViewMode}
                            error={errors.material}
                        />

                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1.5">
                            <p className="font-semibold flex items-center gap-1.5">
                                <ShieldCheck size={14} className="text-amber-700" />
                                Anti-Inferencing Compliance Rule
                            </p>
                            <p className="text-amber-800/90 leading-relaxed text-[11px]">
                                Material identity is strictly determined by this structured selection. The system never infers genuine gold or precious gemstones from product titles, tone keywords, or descriptions.
                            </p>
                        </div>

                        {/* Hallmark Unique ID (HUID) */}
                        <div className="pt-2">
                            <Input
                                label={
                                    <span>
                                        HUID (Hallmark Unique ID)
                                        <span className="text-gray-400 text-xs font-normal ml-1.5">(BIS Alphanumeric Code)</span>
                                    </span>
                                }
                                value={formData.huid || ''}
                                onChange={(e) => setFormData({ ...formData, huid: e.target.value.toUpperCase() })}
                                placeholder="e.g. ABC123"
                                disabled={isViewMode}
                                error={errors.huid}
                                className="font-mono tracking-widest uppercase font-semibold"
                            />
                            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
                                <Info size={12} className="text-amber-600 shrink-0" />
                                6-digit laser-etched BIS hallmark identification code on physical jewellery.
                            </p>
                        </div>
                    </div>
                </FormSection>

                {/* Conditional Material Specification Card */}
                <FormSection title="Metallurgical Standards & Authentication">
                    <div className="space-y-5">
                        {/* GOLD PRODUCT WORKFLOW */}
                        {formData.material === 'Gold' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <Select
                                    label={<span>Gold Purity / Karat <span className="text-red-500">*</span></span>}
                                    value={formData.goldCategory || ''}
                                    onChange={(e) => setFormData({ ...formData, goldCategory: e.target.value })}
                                    options={goldPurityOptions}
                                    disabled={isViewMode}
                                    error={errors.goldCategory}
                                />

                                <Select
                                    label={<span>Gold Tone / Color Finish <span className="text-red-500">*</span></span>}
                                    value={formData.goldTone || ''}
                                    onChange={(e) => setFormData({ ...formData, goldTone: e.target.value })}
                                    options={goldToneOptions}
                                    disabled={isViewMode}
                                    error={errors.goldTone}
                                />

                                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                                    <Info size={14} className="text-amber-700 mt-0.5 shrink-0" />
                                    <span>
                                        <strong>Important:</strong> Gold Tone describes the visible colour/finish (alloy blend). It does not determine Gold purity or replace the Karat purity value.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* SILVER PRODUCT WORKFLOW */}
                        {formData.material === 'Silver' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <Select
                                    label={<span>Silver Purity Standard <span className="text-red-500">*</span></span>}
                                    value={formData.silverCategory || ''}
                                    onChange={(e) => setFormData({ ...formData, silverCategory: e.target.value })}
                                    options={silverPurityOptions}
                                    disabled={isViewMode}
                                    error={errors.silverCategory}
                                />

                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
                                    <Info size={14} className="text-slate-500 mt-0.5 shrink-0" />
                                    <span>
                                        Silver products use certified 925 Sterling Silver or Fine Silver standards. Gold Tone controls are hidden for Silver pieces.
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* DIAMOND PRODUCT WORKFLOW */}
                        {formData.material === 'Diamond' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <Select
                                    label={<span>Diamond Origin Classification <span className="text-red-500">*</span></span>}
                                    value={formData.diamondType || 'none'}
                                    onChange={(e) => {
                                        const diamondType = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            diamondType,
                                            sourceDocumentationConfirmed: false,
                                            variants: (prev.variants || []).map(v => ({ ...v, diamondType }))
                                        }));
                                    }}
                                    options={[
                                        { label: 'Select Diamond Origin', value: 'none' },
                                        { label: 'Natural Diamond (Mined & Certified)', value: 'natural' },
                                        { label: 'Lab-Grown Diamond (CVD / HPHT Certified)', value: 'lab_grown' }
                                    ]}
                                    disabled={isViewMode}
                                    error={errors.diamondType}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select
                                        label={<span>Setting Metal <span className="text-red-500">*</span></span>}
                                        value={formData.settingMetal || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            settingMetal: e.target.value,
                                            settingPurity: '',
                                            goldCategory: '',
                                            sourceDocumentationConfirmed: false
                                        })}
                                        options={[
                                            { label: 'Select Setting Metal', value: '' },
                                            { label: 'Gold (Yellow Gold)', value: 'Gold' },
                                            { label: 'White Gold', value: 'White Gold' },
                                            { label: 'Rose Gold', value: 'Rose Gold' },
                                            { label: 'Platinum', value: 'Platinum' },
                                            { label: 'Silver', value: 'Silver' }
                                        ]}
                                        disabled={isViewMode}
                                        error={errors.settingMetal}
                                    />

                                    <Select
                                        label={<span>Setting Purity <span className="text-red-500">*</span></span>}
                                        value={formData.settingPurity || ''}
                                        onChange={(e) => {
                                            const settingPurity = e.target.value;
                                            const goldCategory = settingPurity.includes('14') ? '14' : settingPurity.includes('18') ? '18' : settingPurity.includes('22') ? '22' : '';
                                            setFormData({
                                                ...formData,
                                                settingPurity,
                                                goldCategory,
                                                sourceDocumentationConfirmed: false
                                            });
                                        }}
                                        options={
                                            formData.settingMetal === 'Platinum'
                                                ? [
                                                    { label: 'Select Setting Purity', value: '' },
                                                    { label: '950 Platinum', value: 'Platinum 950' }
                                                ]
                                                : formData.settingMetal === 'Silver'
                                                    ? [
                                                        { label: 'Select Setting Purity', value: '' },
                                                        { label: '925 Sterling Silver', value: '925 sterling silver' }
                                                    ]
                                                    : [
                                                        { label: 'Select Setting Purity', value: '' },
                                                        { label: '14 Karat (14K)', value: '14K' },
                                                        { label: '18 Karat (18K)', value: '18K' },
                                                        { label: '22 Karat (22K)', value: '22K' }
                                                    ]
                                        }
                                        disabled={isViewMode}
                                        error={errors.settingPurity}
                                    />
                                </div>

                                <Input
                                    label="Verified Certificate URL (GIA / IGI / SGL)"
                                    value={formData.logistics?.certificateUrl || ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        logistics: { ...(formData.logistics || {}), certificateUrl: e.target.value }
                                    })}
                                    placeholder="https://www.igi.org/reports/verify-your-report?r=..."
                                    disabled={isViewMode}
                                />

                                <label className="flex items-start gap-3 rounded-xl border border-pink-200 bg-pink-50/70 p-3.5 text-xs text-pink-900 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(formData.sourceDocumentationConfirmed)}
                                        onChange={(e) => setFormData({ ...formData, sourceDocumentationConfirmed: e.target.checked })}
                                        disabled={isViewMode}
                                        className="mt-0.5 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="leading-relaxed">
                                        I legally confirm that the Diamond origin and all optical claims (carat, clarity, color, cut, shape, count, certificate) are backed by authentic laboratory documentation.
                                        {errors.sourceDocumentationConfirmed && (
                                            <span className="block text-xs font-semibold text-red-600 mt-1">{errors.sourceDocumentationConfirmed}</span>
                                        )}
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* GEMSTONES PRODUCT WORKFLOW */}
                        {formData.material === 'Gems' && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <Select
                                    label={<span>Primary Gemstone Classification <span className="text-red-500">*</span></span>}
                                    value={formData.gemstoneType || ''}
                                    onChange={(e) => setFormData({ ...formData, gemstoneType: e.target.value, sourceDocumentationConfirmed: false })}
                                    options={gemstoneTypeOptions}
                                    disabled={isViewMode}
                                    error={errors.gemstoneType}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select
                                        label={<span>Mounting Setting Metal <span className="text-red-500">*</span></span>}
                                        value={formData.settingMetal || ''}
                                        onChange={(e) => setFormData({ ...formData, settingMetal: e.target.value, settingPurity: '', goldCategory: '', silverCategory: '' })}
                                        options={[
                                            { label: 'Select Setting Metal', value: '' },
                                            { label: 'Gold (Yellow Gold)', value: 'Gold' },
                                            { label: 'White Gold', value: 'White Gold' },
                                            { label: 'Rose Gold', value: 'Rose Gold' },
                                            { label: 'Silver', value: 'Silver' },
                                            { label: 'Platinum', value: 'Platinum' }
                                        ]}
                                        disabled={isViewMode}
                                        error={errors.settingMetal}
                                    />

                                    <Select
                                        label={<span>Setting Purity Standard <span className="text-red-500">*</span></span>}
                                        value={formData.settingPurity || ''}
                                        onChange={(e) => {
                                            const settingPurity = e.target.value;
                                            setFormData({
                                                ...formData,
                                                settingPurity,
                                                goldCategory: settingPurity.includes('14') ? '14' : settingPurity.includes('18') ? '18' : settingPurity.includes('22') ? '22' : '',
                                                silverCategory: settingPurity.includes('925') ? '925 sterling silver' : ''
                                            });
                                        }}
                                        options={
                                            formData.settingMetal === 'Platinum'
                                                ? [
                                                    { label: 'Select Setting Purity', value: '' },
                                                    { label: '950 Platinum', value: 'Platinum 950' }
                                                ]
                                                : formData.settingMetal === 'Silver'
                                                    ? [
                                                        { label: 'Select Setting Purity', value: '' },
                                                        { label: '925 Sterling Silver', value: '925 sterling silver' }
                                                    ]
                                                    : [
                                                        { label: 'Select Setting Purity', value: '' },
                                                        { label: '14 Karat (14K)', value: '14K' },
                                                        { label: '18 Karat (18K)', value: '18K' },
                                                        { label: '22 Karat (22K)', value: '22K' }
                                                    ]
                                        }
                                        disabled={isViewMode}
                                        error={errors.settingPurity}
                                    />
                                </div>

                                <div>
                                    <Input
                                        label={<span>Stone Names / Materials <span className="text-red-500">*</span></span>}
                                        value={(formData.gemstones || []).join(', ')}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            gemstones: e.target.value
                                                .split(',')
                                                .map(v => v.trim())
                                                .filter(Boolean)
                                        })}
                                        placeholder="e.g. Natural Zambian Emerald, Cultured Basra Pearl"
                                        disabled={isViewMode}
                                        error={errors.gemstones}
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Comma-separated list of certified stones present in this design.</p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/60 text-[11px] text-purple-900 flex items-start gap-2">
                                    <Info size={14} className="text-purple-600 mt-0.5 shrink-0" />
                                    <span>
                                        Use Ruby, Emerald or Sapphire only when supported by source certification. Decorative imitation or synthetic glass must be identified accordingly.
                                    </span>
                                </div>

                                {['Ruby', 'Emerald', 'Sapphire'].includes(formData.gemstoneType) && (
                                    <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(formData.sourceDocumentationConfirmed)}
                                            onChange={(e) => setFormData({ ...formData, sourceDocumentationConfirmed: e.target.checked })}
                                            disabled={isViewMode}
                                            className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="leading-relaxed">
                                            I confirm this named precious gemstone is supported by authentic mineralogical source documentation and is not merely a descriptive hue.
                                            {errors.sourceDocumentationConfirmed && (
                                                <span className="block text-xs font-semibold text-red-600 mt-1">{errors.sourceDocumentationConfirmed}</span>
                                            )}
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* OTHER MATERIAL WORKFLOW */}
                        {formData.material === 'Other' && (
                            <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 animate-in fade-in duration-300">
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <AlertTriangle size={15} className="text-amber-600" />
                                    Non-Precious / Plated Alloy Specification
                                </div>
                                <p className="leading-relaxed text-[11px]">
                                    This product will follow <strong>fixed manual pricing</strong>. The system will NOT link it to live API Mitra Gold or Silver market rates. Even if the title contains the word "Gold" (such as "Gold Plated"), no precious bullion rates are consumed.
                                </p>
                            </div>
                        )}
                    </div>
                </FormSection>
            </div>
        </div>
    );
};

export default Step2ProductMaterial;
