import React from 'react';
import {
    Upload, X, Trash2, ImagePlus, FileText, CheckCircle2,
    Info, Video, Sparkles, Layers
} from 'lucide-react';
import { FormSection } from '../../../admin/components/common/FormControls';
import AlankarJewelleryMark from '../AlankarJewelleryMark';

const Step6ProductMedia = ({
    formData,
    setFormData,
    errors = {},
    isViewMode,
    previewImages = [],
    handleImageUpload,
    handleRemoveImage,
    handleVideoUpload,
    handleRemoveVideo,
    resolvedVideoPreview,
    isImageVideoPreview,
    removeVideo,
    handleVariantImageUpload,
    handleRemoveVariantUpload,
    variantImagePreviews = {},
    handleRemoveSavedVariantImage,
    activeVariantIndex = 0
}) => {
    const variants = formData.variants || [];
    const currentVariant = variants[activeVariantIndex] || variants[0] || {};
    const currentVariantUploads = variantImagePreviews[currentVariant.id] || [];
    const currentVariantSaved = currentVariant.variantImages || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step Header Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 font-bold text-sm">
                        06
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Media Gallery & Visual Narrative</h2>
                        <p className="text-xs text-gray-500 mt-0.5">High-definition atelier product photography, 360-degree video stories, and variant image overrides</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                        Step 6 of 8
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Columns: Master Product Gallery */}
                <div className="lg:col-span-7 space-y-6">
                    <FormSection title="Master Product Gallery (Up to 5 Photos)">
                        <div className="space-y-5">
                            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
                                <Info size={15} className="text-amber-700 mt-0.5 shrink-0" />
                                <div className="space-y-0.5">
                                    <p className="font-semibold">Atelier Photography Standards</p>
                                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                                        Slot 1 is the <strong>Primary Listing Image</strong>. Slot 2 is the <strong>Hover Preview</strong>. Upload genuine high-resolution photographs of the physical piece (recommended 1080×1080px, 1:1 ratio).
                                    </p>
                                </div>
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                {previewImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-xs ring-1 ring-black/5 hover:ring-amber-300 transition-all"
                                    >
                                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                                        {/* Badge Labels */}
                                        <div className="absolute bottom-2.5 left-2.5 flex gap-1">
                                            {idx === 0 && (
                                                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider">
                                                    Primary
                                                </span>
                                            )}
                                            {idx === 1 && (
                                                <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#3E2723] text-[9px] font-bold uppercase tracking-wider">
                                                    Hover
                                                </span>
                                            )}
                                        </div>

                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-500 hover:text-red-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remove Photo"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {!isViewMode && previewImages.length < 5 && (
                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 hover:bg-amber-50/20 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                        <div className="p-3 rounded-full bg-gray-50 group-hover:bg-amber-100 text-gray-400 group-hover:text-amber-700 transition-colors">
                                            <ImagePlus size={20} />
                                        </div>
                                        <span className="text-[11px] font-semibold text-gray-500 group-hover:text-amber-800 mt-2">Add Photo</span>
                                        <span className="text-[9px] text-gray-400">({previewImages.length}/5 uploaded)</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>

                            {/* Image Integrity Confirmation Checkbox */}
                            <label className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(formData.imageIntegrityConfirmed)}
                                    onChange={(e) => setFormData({ ...formData, imageIntegrityConfirmed: e.target.checked })}
                                    disabled={isViewMode}
                                    className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="leading-relaxed">
                                    I verified that every uploaded image shows this exact physical product and accurately represents its metal purity, tone, and documented gemstones.
                                    {errors.imageIntegrityConfirmed && (
                                        <span className="block text-xs font-semibold text-red-600 mt-1">{errors.imageIntegrityConfirmed}</span>
                                    )}
                                </span>
                            </label>
                            {errors.images && <p className="text-xs font-semibold text-red-600">{errors.images}</p>}
                        </div>
                    </FormSection>

                    {/* Variant Image Overrides Section */}
                    <FormSection title={`Variant Image Override (${currentVariant.name || 'Standard'})`}>
                        <div className="space-y-4">
                            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2">
                                <Info size={14} className="text-blue-600 mt-0.5 shrink-0" />
                                <span className="leading-relaxed text-[11px]">
                                    <strong>Variant Override Behavior:</strong> Variant images override the product gallery for this specific variant. If no variant images are uploaded, the product gallery above is used automatically (Fallback Active).
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                {!isViewMode && (
                                    <label className="px-4 py-2.5 bg-white border border-gray-200 hover:border-[#3E2723] rounded-xl text-xs font-semibold text-gray-700 hover:text-[#3E2723] transition-all cursor-pointer shadow-xs flex items-center gap-2">
                                        <ImagePlus size={14} /> Upload Variant Images
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleVariantImageUpload(currentVariant.id, e.target.files)}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {/* Uploaded Previews */}
                                {currentVariantUploads.map((img, pIdx) => (
                                    <div key={`upload-${pIdx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariantUpload(currentVariant.id, pIdx)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-600 rounded-md shadow-xs"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Saved Variant Images */}
                                {currentVariantSaved.map((img, sIdx) => (
                                    <div key={`saved-${sIdx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSavedVariantImage(currentVariant.id, img)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-600 rounded-md shadow-xs"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {currentVariantUploads.length === 0 && currentVariantSaved.length === 0 && (
                                <div className="text-center py-5 bg-gray-50/70 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500">No variant-specific images</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Customer viewing this variant will see the Master Product Gallery</p>
                                </div>
                            )}
                        </div>
                    </FormSection>
                </div>

                {/* Right 5 Columns: Video Narrative */}
                <div className="lg:col-span-5 space-y-6">
                    <FormSection title="Visual Narrative (Product Video)">
                        <div className="space-y-4">
                            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 bg-[#0c0c0c] shadow-sm flex items-center justify-center group">
                                {removeVideo ? (
                                    <div className="text-center p-6 space-y-2">
                                        <Trash2 size={24} className="text-red-400 mx-auto animate-pulse" />
                                        <p className="text-xs font-bold text-red-400">Video marked for removal</p>
                                    </div>
                                ) : resolvedVideoPreview ? (
                                    <>
                                        {isImageVideoPreview ? (
                                            <img src={resolvedVideoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={resolvedVideoPreview} controls playsInline className="w-full h-full object-cover" />
                                        )}
                                        {!isViewMode && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveVideo}
                                                className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove Video"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center p-6 text-white/40 space-y-1.5">
                                        <Video size={28} className="mx-auto text-white/30" />
                                        <p className="text-xs font-semibold">No Video Attached</p>
                                        <p className="text-[10px] text-white/30 max-w-xs">Upload an MP4 or MOV clip showcasing sparkle and drape</p>
                                    </div>
                                )}
                            </div>

                            {!isViewMode && (
                                <label className="w-full py-3 bg-white border border-gray-200 hover:border-[#3E2723] rounded-xl text-xs font-semibold text-gray-700 hover:text-[#3E2723] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                                    <Upload size={14} /> {resolvedVideoPreview ? 'Replace Video Story' : 'Upload Video Story (MP4/MOV)'}
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                </label>
                            )}
                        </div>
                    </FormSection>
                </div>
            </div>
        </div>
    );
};

export default Step6ProductMedia;
