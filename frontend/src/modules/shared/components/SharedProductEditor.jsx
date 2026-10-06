import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Download, CheckCircle2 as SuccessIcon, Copy, QrCode, Barcode as BarcodeIcon,
    Loader2, Plus, Upload, X, Trash2, ImagePlus, ExternalLink,
    FileText, CheckCircle2, IndianRupee, Scale, Tag, Box, Zap, Coins,
    Calculator, Layers, Search, Truck, Info, ChevronRight, LayoutDashboard,
    ArrowLeft, Eye, ShieldCheck, Sparkles, Send, ArrowRight
} from 'lucide-react';
import Barcode from 'react-barcode';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { downloadImage, downloadSvgNode } from '../../../utils/downloadUtils';
import familyVideoFrame from '@/assets/products/family/videoframe_23898.png';

// 8 Discrete Step Components
import Step1ProductIdentity from './product-editor/Step1ProductIdentity';
import Step2ProductMaterial from './product-editor/Step2ProductMaterial';
import Step3ProductPricing from './product-editor/Step3ProductPricing';
import Step4ProductInventory from './product-editor/Step4ProductInventory';
import Step5ProductBarcode from './product-editor/Step5ProductBarcode';
import Step6ProductMedia from './product-editor/Step6ProductMedia';
import Step7ProductContent from './product-editor/Step7ProductContent';
import Step8ProductReview from './product-editor/Step8ProductReview';

// Utilities
import {
    roundCurrency,
    IMAGE_PREVIEW_RE,
    ENHANCEMENT_PROMPT,
    normalizeSerialCodes,
    getAvailableSerialCodes,
    getPricingForVariant,
    getPricingConfigurationError,
    syncVariantSerialQuantity
} from '../utils/productEditorUtils';

const STEPS = [
    { id: 'identity', stepNumber: 1, label: 'Identity', icon: Tag, description: 'Product Name & Category' },
    { id: 'material', stepNumber: 2, label: 'Material', icon: ShieldCheck, description: 'Gold, Silver & Gems' },
    { id: 'pricing', stepNumber: 3, label: 'Pricing', icon: IndianRupee, description: 'Live Rates & Valuation' },
    { id: 'inventory', stepNumber: 4, label: 'Inventory', icon: Box, description: 'Stock & Serialization' },
    { id: 'barcode', stepNumber: 5, label: 'Barcode', icon: BarcodeIcon, description: 'Reference & Tags' },
    { id: 'media', stepNumber: 6, label: 'Media', icon: ImagePlus, description: 'Gallery & Video' },
    { id: 'content', stepNumber: 7, label: 'Content', icon: FileText, description: 'Description & FAQs' },
    { id: 'review', stepNumber: 8, label: 'Review', icon: CheckCircle2, description: 'Audit & Publish' }
];

const SharedProductEditor = ({
    productApi,
    metalPricingApi,
    backPath = '/admin/products',
    categoryApi,
    editorMode = 'admin'
}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminMode = true;
    const storageKey = 'Alankar_admin_add_product_form';

    const isViewMode = location.pathname.includes('/view/');
    const isEditMode = Boolean(id) && !isViewMode;

    // Navigation Step State
    const [activeTab, setActiveTab] = useState('identity');
    const [activeVariantIndex, setActiveVariantIndex] = useState(0);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode || isViewMode);
    const [imageFiles, setImageFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [variantImageFiles, setVariantImageFiles] = useState({});
    const [variantImagePreviews, setVariantImagePreviews] = useState({});
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [removeVideo, setRemoveVideo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [liveErrors, setLiveErrors] = useState({});
    const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdProductData, setCreatedProductData] = useState(null);
    const [gstRate, setGstRate] = useState(3);
    const [metalRates, setMetalRates] = useState({
        gold10g: { k14: 0, k18: 0, k22: 0, k24: 0 },
        silver10g: { sterling925: 0, silverOther: 0 },
        platinum10g: { pt950: 0 }
    });
    const [rateSourceInfo, setRateSourceInfo] = useState({
        source: 'API Mitra',
        isLive: true,
        city: 'Mumbai',
        updatedAt: null
    });

    const serialBarcodeRefs = useRef({});

    // AI Enhancement States
    const [enhancingIndex, setEnhancingIndex] = useState(null);
    const [showEnhanceModal, setShowEnhanceModal] = useState(false);
    const [enhancedIndices, setEnhancedIndices] = useState(new Set());

    const [formData, setFormData] = useState(() => {
        const initial = {
            name: '',
            productCode: '',
            huid: '',
            material: 'Gold',
            goldCategory: '22',
            goldTone: 'Yellow Gold',
            silverCategory: '',
            gemstoneType: '',
            gemstones: [],
            imageIntegrityConfirmed: false,
            sourceDocumentationConfirmed: false,
            description: '',
            specifications: '',
            supplierInfo: '',
            stylingTips: '',
            careTips: '',
            diamondType: 'none',
            categories: [],
            variants: [{
                id: Date.now(),
                name: 'Standard',
                size: '',
                weight: '',
                weightUnit: 'Grams',
                makingCharge: '0',
                hallmarkingCharge: '0',
                diamondCertificateCharge: '0',
                additionalCharge: '0',
                diamondPrice: '0',
                diamondType: 'none',
                mrp: '0',
                price: '',
                stock: 0,
                serialCodes: [],
                hiddenCharge: 0,
                subtotalBeforeTax: 0,
                gstAmount: 0,
                priceAfterTax: 0,
                pgChargePercent: 0,
                pgChargeAmount: 0,
                variantCode: '',
                variantImages: [],
                variantFaqs: [],
                diamondSpecs: {
                    carat: '',
                    clarity: '',
                    color: '',
                    cut: '',
                    shape: '',
                    diamondCount: 0
                },
                diamondPricing: { enabled: false, pricingMode: 'total', pricePerCarat: 0, totalPrice: 0, certificateCharge: 0, certificateUrl: '' },
                gemstonePricing: []
            }],
            faqs: [],
            seo: { title: '', description: '', keywords: '' },
            logistics: { estimatedShippingDays: 3, certificateUrl: '' },
            deletedImages: [],
            tags: {
                isNewArrival: false,
                isMostGifted: false,
                isNewLaunch: false,
                isTrending: false,
                isPremium: false
            },
            relatedProducts: [],
            weight: '',
            weightUnit: 'Grams',
            paymentGatewayChargeBearer: 'store',
            videoUrl: '',
            status: 'Active',
            active: true,
            showInNavbar: true,
            showInCollection: true,
            cardLabel: '',
            cardBadge: '',
            audience: ['unisex'],
            settingMetal: '',
            settingPurity: ''
        };

        if (typeof window !== 'undefined' && !id) {
            const saved = localStorage.getItem(storageKey) || localStorage.getItem('sands_admin_add_product_form');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && typeof parsed === 'object') {
                        return { ...initial, ...parsed };
                    }
                } catch (e) {
                    console.error("Failed to parse saved product form", e);
                }
            }
        }
        return initial;
    });

    useEffect(() => {
        if (!isEditMode && !isViewMode) {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        }
    }, [formData, isEditMode, isViewMode, storageKey]);

    useEffect(() => {
        const newErrors = {};

        // 1. Name
        if (!formData.name) {
            newErrors.name = "Product Name is required";
        }

        // 2. Category
        if (!formData.categories?.[0]?.category) {
            newErrors.categories = "Category is required.";
        }

        // Material standards
        if (formData.material === 'Gems' && !String(formData.gemstoneType || '').trim()) {
            newErrors.gemstoneType = "Gemstone type is required for Gems products.";
        }
        if (formData.material === 'Gems' && !(formData.gemstones || []).length) {
            newErrors.gemstones = "At least one verified gemstone/material entry is required.";
        }
        if (formData.material === 'Gems' && ['Ruby', 'Emerald', 'Sapphire'].includes(formData.gemstoneType) && !formData.sourceDocumentationConfirmed) {
            newErrors.sourceDocumentationConfirmed = "Source documentation is required for this gemstone claim.";
        }
        if (formData.material === 'Gold' && !formData.goldCategory) {
            newErrors.goldCategory = "Gold purity is required.";
        }
        if (formData.material === 'Gold' && !formData.goldTone) {
            newErrors.goldTone = "Gold tone is required.";
        }
        if (formData.material === 'Silver' && !formData.silverCategory) {
            newErrors.silverCategory = "Silver purity is required.";
        }
        if (['Diamond', 'Gems'].includes(formData.material)) {
            if (!formData.settingMetal) newErrors.settingMetal = "Setting metal is required.";
            if (!formData.settingPurity) newErrors.settingPurity = "Setting purity is required.";
        }
        if (formData.material === 'Diamond') {
            if (!formData.diamondType || formData.diamondType === 'none') newErrors.diamondType = "Diamond origin is required.";
            if (!formData.sourceDocumentationConfirmed) newErrors.sourceDocumentationConfirmed = "Confirm the diamond claims are supported by source documentation.";
        }
        if (formData.status === 'Active') {
            const pricingConfigurationError = getPricingConfigurationError(formData, metalRates);
            if (pricingConfigurationError) newErrors.pricingConfiguration = pricingConfigurationError;
        }

        // Logistics
        if (formData.logistics?.estimatedShippingDays !== undefined && formData.logistics?.estimatedShippingDays !== '') {
            const days = parseInt(formData.logistics.estimatedShippingDays);
            if (isNaN(days) || days <= 0) {
                newErrors.estimatedShippingDays = "Estimated shipping days must be a positive number";
            }
        }

        // Variants
        if (formData.variants) {
            formData.variants.forEach((v, i) => {
                if (!v.name) {
                    newErrors[`variant_${v.id}_name`] = "Variant name required";
                    newErrors[`variant_${i}_name`] = "Variant name required";
                }

                if (v.weight === undefined || v.weight === '') {
                    newErrors[`variant_${v.id}_weight`] = "Weight required";
                    newErrors[`variant_${i}_weight`] = "Weight required";
                } else {
                    const vw = parseFloat(v.weight);
                    if (isNaN(vw) || vw <= 0) {
                        newErrors[`variant_${v.id}_weight`] = "Weight must be a positive number";
                        newErrors[`variant_${i}_weight`] = "Weight must be a positive number";
                    }
                }

                // Numeric charges checks
                const numericFields = [
                    { name: 'makingCharge', label: 'Making charge' },
                    { name: 'hallmarkingCharge', label: 'Hallmarking charge' },
                    { name: 'diamondPrice', label: 'Diamond / Stones price' },
                    { name: 'diamondCertificateCharge', label: 'Certificate charge' },
                    { name: 'additionalCharge', label: 'Additional charge' }
                ];
                numericFields.forEach(field => {
                    if (v[field.name] !== undefined && v[field.name] !== '') {
                        const val = parseFloat(v[field.name]);
                        if (isNaN(val) || val < 0) {
                            newErrors[`variant_${v.id}_${field.name}`] = `${field.label} cannot be negative`;
                            newErrors[`variant_${i}_${field.name}`] = `${field.label} cannot be negative`;
                        }
                    }
                });

                if (v.diamondPricing?.enabled) {
                    const mode = v.diamondPricing.pricingMode || 'total';
                    if (!['total', 'per_carat'].includes(mode)) newErrors[`variant_${i}_diamondPrice`] = "Invalid diamond pricing mode";
                    if (mode === 'per_carat' && (!(Number(v.diamondSpecs?.carat) > 0) || !(Number(v.diamondPricing.pricePerCarat) > 0))) {
                        newErrors[`variant_${i}_diamondPrice`] = "Per-carat diamond pricing requires carat and price per carat greater than zero";
                    }
                    if ([v.diamondPricing.pricePerCarat, v.diamondPricing.totalPrice, v.diamondPricing.certificateCharge].some(value => Number(value) < 0)) {
                        newErrors[`variant_${i}_diamondPrice`] = "Diamond pricing cannot be negative";
                    }
                }

                if (formData.material === 'Diamond' && !v.diamondPricing?.enabled && !(Number(v.diamondPrice) > 0)) {
                    newErrors[`variant_${i}_diamondPrice`] = "Diamond pricing is required";
                }
                if (formData.material === 'Gems' && !(v.gemstonePricing || []).length && !(Number(v.diamondPrice) > 0)) {
                    newErrors[`variant_${i}_diamondPrice`] = "Gemstone pricing is required";
                }

                (v.gemstonePricing || []).forEach((stone, stoneIndex) => {
                    const prefix = `Gemstone ${stoneIndex + 1}`;
                    if (!stone.gemstoneType) newErrors[`variant_${i}_gemstone_${stoneIndex}`] = `${prefix}: type is required`;
                    if (!(Number(stone.quantity) > 0)) newErrors[`variant_${i}_gemstone_${stoneIndex}`] = `${prefix}: quantity must be greater than zero`;
                    if ([stone.weight, stone.pricePerCarat, stone.totalPrice, stone.certificateCharge].some(value => Number(value) < 0)) {
                        newErrors[`variant_${i}_gemstone_${stoneIndex}`] = `${prefix}: pricing cannot be negative`;
                    }
                    if (stone.pricingMode === 'per_carat' && (!(Number(stone.weight) > 0) || !(Number(stone.pricePerCarat) > 0))) {
                        newErrors[`variant_${i}_gemstone_${stoneIndex}`] = `${prefix}: per-carat pricing requires weight and price per carat greater than zero`;
                    }
                });

                if (formData.status === 'Active' && Number(v.stock) <= 0) {
                    newErrors[`variant_${v.id}_stock`] = "Positive stock is required before publishing.";
                    newErrors[`variant_${i}_stock`] = "Positive stock is required before publishing.";
                }

                const pricing = getPricingForVariant(v, formData, metalRates, gstRate);
                if (formData.status === 'Active' && pricing.finalPrice <= 0) {
                    newErrors[`variant_${v.id}_price`] = "Final product price must be greater than ₹0.";
                    newErrors[`variant_${i}_price`] = "Final product price must be greater than ₹0.";
                }
            });
        }

        setLiveErrors(newErrors);
    }, [formData, metalRates, gstRate]);

    const combinedErrors = useMemo(() => {
        if (!hasTriedSubmit) return {};
        return {
            ...errors,
            ...liveErrors
        };
    }, [errors, liveErrors, hasTriedSubmit]);

    const setSerialBarcodeRef = (key, node) => {
        if (node) {
            serialBarcodeRefs.current[key] = node;
        } else {
            delete serialBarcodeRefs.current[key];
        }
    };

    const handleDownloadSerialBarcode = (serialCode) => {
        const container = serialBarcodeRefs.current[serialCode];
        const svgNode = container?.querySelector?.('svg');
        if (!svgNode) {
            toast.error('Barcode preview is not ready yet');
            return;
        }
        downloadSvgNode(svgNode, `serial-${serialCode}.svg`);
    };

    const handleDownloadAllSerialBarcodes = (variant) => {
        const codes = (variant.serialCodes || []).map(c => c.code);
        if (codes.length === 0) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Popup blocker prevented opening the print window. Please allow popups for this site.");
            return;
        }

        let svgItemsHtml = '';
        codes.forEach(code => {
            const container = serialBarcodeRefs.current[code];
            const svgNode = container?.querySelector?.('svg');
            if (svgNode) {
                const serializer = new XMLSerializer();
                const svgMarkup = serializer.serializeToString(svgNode);
                svgItemsHtml += `
                    <div class="barcode-card">
                        <div class="barcode-svg">${svgMarkup}</div>
                        <div class="barcode-code">${code}</div>
                    </div>
                `;
            }
        });

        if (!svgItemsHtml) {
            toast.error("Barcodes are not loaded in the view yet.");
            printWindow.close();
            return;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>Barcodes - ${variant.name || 'variant'}</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        margin: 0;
                        padding: 30px;
                        background: white;
                        color: black;
                        -webkit-print-color-adjust: exact;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                        gap: 20px;
                    }
                    .barcode-card {
                        border: 1px solid #eaeaea;
                        border-radius: 12px;
                        padding: 16px;
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        page-break-inside: avoid;
                        background: #fff;
                    }
                    .barcode-svg svg {
                        width: 130px;
                        height: auto;
                    }
                    .barcode-code {
                        font-size: 11px;
                        font-weight: 700;
                        font-family: monospace;
                        margin-top: 8px;
                        letter-spacing: 1px;
                        color: #222;
                    }
                </style>
            </head>
            <body>
                <h3 style="margin-top: 0; margin-bottom: 20px; text-transform: uppercase; font-size: 12px; font-weight: 800; letter-spacing: 2px; border-bottom: 2px solid #000; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span>Alankar JEWELLERS • Barcodes Batch (${variant.name || 'Variant'})</span>
                    <span style="color: #666; font-size: 10px;">${codes.length} Units</span>
                </h3>
                <div class="grid">
                    ${svgItemsHtml}
                </div>
                <script>
                    setTimeout(() => { window.print(); }, 500);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const resolvedProductApi = productApi;
    const resolvedMetalPricingApi = metalPricingApi;
    const isFamilyVideoFrameProduct = id === '69ef0e442cf9c0c98d8aab52';
    const familyVideoFramePreview = !removeVideo && isEditMode && isFamilyVideoFrameProduct && !videoPreview && !formData.videoUrl
        ? familyVideoFrame
        : '';
    const resolvedVideoPreview = videoPreview || formData.videoUrl || familyVideoFramePreview;
    const isImageVideoPreview = Boolean(resolvedVideoPreview) && (
        IMAGE_PREVIEW_RE.test(resolvedVideoPreview) ||
        /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(String(resolvedVideoPreview))
    );

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryResult = await (categoryApi ? categoryApi() : Promise.resolve([]));
                const list = Array.isArray(categoryResult)
                    ? categoryResult
                    : (categoryResult?.data?.data?.categories || categoryResult?.data?.categories || []);
                setCategories(list.filter(cat => cat.isActive !== false));
            } catch (err) {
                toast.error("Failed to load categories");
            }
        };
        loadCategories();
    }, [categoryApi]);

    useEffect(() => {
        const loadPricing = async () => {
            try {
                if (!resolvedMetalPricingApi?.getMetalPricing) return;
                const res = await resolvedMetalPricingApi.getMetalPricing();
                if (res?.metalRates) {
                    setMetalRates(prev => ({
                        ...prev,
                        ...res.metalRates
                    }));
                }
                if (res?.gstRate !== undefined && res?.gstRate !== null) {
                    setGstRate(Number(res.gstRate) || 0);
                }

                // Check live rate source info
                try {
                    const publicRateRes = await api.get('/public/metal-rates');
                    if (publicRateRes?.data?.success) {
                        setRateSourceInfo({
                            source: publicRateRes.data.isLive ? 'API Mitra' : (publicRateRes.data.source || 'API Mitra (Cached)'),
                            isLive: publicRateRes.data.isLive === true,
                            city: publicRateRes.data.city || 'Mumbai',
                            updatedAt: publicRateRes.data.updatedAt
                        });
                    }
                } catch (e) {
                    setRateSourceInfo({
                        source: 'Admin Centralized Rate',
                        isLive: false,
                        city: 'National Standard'
                    });
                }
            } catch (err) {
                // silent fallback
            }
        };
        loadPricing();
    }, [resolvedMetalPricingApi]);

    useEffect(() => {
        const loadProduct = async () => {
            if (!isEditMode && !isViewMode) {
                setLoading(false);
                return;
            }
            try {
                if (!resolvedProductApi?.getProduct) return;
                const data = await resolvedProductApi.getProduct(id);
                if (data) {
                    const normalizedCategories = (data.categories || []).map(c => ({
                        category: typeof c === 'object' ? (c._id || c.name || '') : c
                    }));

                    const {
                        _id, id: legacyId, image, sellerId, sku, rating, reviewCount,
                        createdAt, updatedAt, __v, slug, brand, status, active,
                        showInNavbar, showInCollection, ...restData
                    } = data;

                    const mappedVariants = data.variants?.map((v, index) => {
                        const serialCodes = normalizeSerialCodes(v.serialCodes || []);
                        const prefix = String(data.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || 'ITEM';
                        const availableCount = serialCodes.filter(code => (code.status || 'AVAILABLE') === 'AVAILABLE').length;
                        const desiredCount = availableCount || Number(v.stock) || 0;
                        const ensured = serialCodes.length > 0
                            ? { serialCodes, stock: availableCount }
                            : syncVariantSerialQuantity({ serialCodes: [] }, index, desiredCount, prefix);

                        return {
                            ...v,
                            id: v._id || Math.random(),
                            weight: v.weight ?? data.weight ?? '',
                            weightUnit: v.weightUnit || data.weightUnit || 'Grams',
                            makingCharge: (v.makingCharge || 0).toString(),
                            hallmarkingCharge: (v.hallmarkingCharge || 0).toString(),
                            diamondCertificateCharge: (
                                v.diamondCertificateCharge !== undefined && v.diamondCertificateCharge !== null
                                    ? v.diamondCertificateCharge
                                    : 0
                            ).toString(),
                            additionalCharge: (v.additionalCharge || 0).toString(),
                            diamondPrice: (v.diamondPrice || 0).toString(),
                            diamondType: v.diamondType || data.diamondType || 'none',
                            serialCodes: ensured.serialCodes,
                            stock: ensured.stock,
                            variantImages: Array.isArray(v.variantImages) ? v.variantImages : [],
                            variantFaqs: Array.isArray(v.variantFaqs) ? v.variantFaqs : [],
                            diamondSpecs: {
                                carat: v.diamondSpecs?.carat || '',
                                clarity: v.diamondSpecs?.clarity || '',
                                color: v.diamondSpecs?.color || '',
                                cut: v.diamondSpecs?.cut || '',
                                shape: v.diamondSpecs?.shape || '',
                                diamondCount: v.diamondSpecs?.diamondCount || 0
                            },
                            diamondPricing: {
                                enabled: Boolean(v.diamondPricing?.enabled),
                                pricingMode: v.diamondPricing?.pricingMode || 'total',
                                pricePerCarat: v.diamondPricing?.pricePerCarat ?? 0,
                                totalPrice: v.diamondPricing?.totalPrice ?? 0,
                                certificateCharge: v.diamondPricing?.certificateCharge ?? 0,
                                certificateUrl: v.diamondPricing?.certificateUrl || ''
                            },
                            gemstonePricing: Array.isArray(v.gemstonePricing) ? v.gemstonePricing : []
                        };
                    }) || [];

                    setFormData(prev => ({
                        ...prev,
                        ...restData,
                        material: data.material || data.metal || 'Gold',
                        audience: Array.isArray(data.audience) && data.audience.length > 0 ? data.audience : ['unisex'],
                        weight: data.weight || '',
                        weightUnit: data.weightUnit || 'Grams',
                        paymentGatewayChargeBearer: data.paymentGatewayChargeBearer === 'user' ? 'user' : 'store',
                        diamondType: data.diamondType || 'none',
                        categories: normalizedCategories.slice(0, 1),
                        variants: mappedVariants.length > 0 ? mappedVariants : prev.variants,
                        faqs: data.faqs || [],
                        seo: data.seo || { title: '', description: '', keywords: '' },
                        logistics: data.logistics || { estimatedShippingDays: 3, certificateUrl: '' },
                        careTips: data.careTips || '',
                        stylingTips: data.stylingTips || '',
                        supplierInfo: data.supplierInfo || '',
                        specifications: data.specifications || '',
                        tags: data.tags || { isNewArrival: false, isMostGifted: false, isNewLaunch: false, isTrending: false, isPremium: false },
                        relatedProducts: data.relatedProducts || [],
                        videoUrl: data.videoUrl || '',
                        isSerialized: true
                    }));

                    if (data.images) setPreviewImages(data.images);
                    setVideoPreview(data.videoUrl || '');
                    setLoading(false);
                }
            } catch (err) {
                toast.error("Failed to load product");
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    // Handlers
    const handleVideoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoFile(file);
        setRemoveVideo(false);
        setVideoPreview(URL.createObjectURL(file));
    };

    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoPreview('');
        setRemoveVideo(true);
        setFormData(prev => ({ ...prev, videoUrl: '' }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.slice(0, 5 - imageFiles.length);
        const previews = newFiles.map(file => URL.createObjectURL(file));
        setImageFiles(prev => [...prev, ...newFiles]);
        setPreviewImages(prev => [...prev, ...previews].slice(0, 5));
        setFormData(prev => ({ ...prev, imageIntegrityConfirmed: false }));
    };

    const handleHoverImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (previewImages.length >= 5) {
            toast.error('You can upload up to 5 images.');
            return;
        }
        const preview = URL.createObjectURL(file);
        setImageFiles(prev => [...prev, file]);
        setPreviewImages(prev => [...prev, preview].slice(0, 5));
        setFormData(prev => ({ ...prev, imageIntegrityConfirmed: false }));
    };

    const handleRemoveImage = (index) => {
        const removedImage = previewImages[index];
        const newPreviewImages = previewImages.filter((_, i) => i !== index);

        const updates = { deletedImages: [...formData.deletedImages] };
        if (typeof removedImage === 'string' && !removedImage.startsWith('blob:')) {
            updates.deletedImages.push(removedImage);
        } else if (removedImage?.startsWith('blob:')) {
            const newFileIndex = previewImages.slice(0, index).filter(img => img.startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
        }

        setFormData(prev => ({ ...prev, deletedImages: updates.deletedImages, imageIntegrityConfirmed: false }));
        setPreviewImages(newPreviewImages);
    };

    const handleVariantChange = (vid, field, value) => {
        setFormData(prev => ({
            ...prev,
            sourceDocumentationConfirmed: false,
            variants: prev.variants.map(v => {
                if (v.id === vid) {
                    const updated = { ...v, [field]: value };

                    if (['makingCharge', 'hallmarkingCharge', 'diamondCertificateCharge', 'additionalCharge', 'diamondPrice', 'diamondPricing', 'gemstonePricing', 'weight', 'weightUnit'].includes(field)) {
                        const pricing = getPricingForVariant(updated, prev, metalRates, gstRate);
                        updated.mrp = pricing.finalPrice.toString();
                        updated.price = pricing.finalPrice.toString();
                        updated.metalPrice = pricing.metalPrice;
                        updated.hiddenCharge = pricing.hiddenCharge;
                        updated.subtotalBeforeTax = pricing.subtotalBeforeTax;
                        updated.gstAmount = pricing.gstValue;
                        updated.priceAfterTax = pricing.priceAfterTax;
                        updated.pgChargePercent = pricing.pgChargePercent;
                        updated.pgChargeAmount = pricing.pgChargeAmount;
                        updated.gst = pricing.gstValue;
                        updated.finalPrice = pricing.finalPrice;
                    }
                    return updated;
                }
                return v;
            })
        }));
    };

    const handleDiamondSpecChange = (vid, field, value) => {
        setFormData(prev => ({
            ...prev,
            sourceDocumentationConfirmed: false,
            variants: prev.variants.map(v => {
                if (v.id === vid) {
                    const updated = {
                        ...v,
                        diamondSpecs: {
                            ...(v.diamondSpecs || {}),
                            [field]: value
                        }
                    };
                    const pricing = getPricingForVariant(updated, prev, metalRates, gstRate);
                    updated.mrp = pricing.finalPrice.toString();
                    updated.price = pricing.finalPrice.toString();
                    return updated;
                }
                return v;
            })
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, {
                id: Date.now(),
                name: `Variant #${prev.variants.length + 1}`,
                size: '',
                weight: prev.weight || '',
                weightUnit: prev.weightUnit || 'Grams',
                makingCharge: '0',
                hallmarkingCharge: '0',
                diamondCertificateCharge: '0',
                additionalCharge: '0',
                diamondPrice: '0',
                diamondType: prev.diamondType || 'none',
                mrp: '0',
                price: '',
                stock: 0,
                serialCodes: [],
                hiddenCharge: 0,
                subtotalBeforeTax: 0,
                gstAmount: 0,
                priceAfterTax: 0,
                pgChargePercent: 0,
                pgChargeAmount: 0,
                variantCode: '',
                variantImages: [],
                variantFaqs: [],
                diamondSpecs: {
                    carat: '',
                    clarity: '',
                    color: '',
                    cut: '',
                    shape: '',
                    diamondCount: 0
                },
                diamondPricing: { enabled: false, pricingMode: 'total', pricePerCarat: 0, totalPrice: 0, certificateCharge: 0, certificateUrl: '' },
                gemstonePricing: []
            }]
        }));
        setActiveVariantIndex(formData.variants.length);
    };

    const removeVariant = (id) => {
        if (formData.variants.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter(v => v.id !== id)
        }));
        setActiveVariantIndex(0);
    };

    const updateVariantSerialQuantity = (id, desiredCount) => {
        const count = Math.max(0, parseInt(desiredCount || 0, 10));
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, index) => {
                if (v.id !== id) return v;
                const prefix = String(prev.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) || 'ITEM';
                return syncVariantSerialQuantity(v, index, count, prefix);
            })
        }));
    };

    const handleVariantImageUpload = (variantId, filesList) => {
        const files = Array.from(filesList || []);
        if (!variantId || files.length === 0) return;

        const previews = files.map((file) => URL.createObjectURL(file));
        setVariantImageFiles((prev) => ({
            ...prev,
            [variantId]: [...(prev[variantId] || []), ...files]
        }));
        setVariantImagePreviews((prev) => ({
            ...prev,
            [variantId]: [...(prev[variantId] || []), ...previews]
        }));
        setFormData(prev => ({ ...prev, imageIntegrityConfirmed: false }));
    };

    const handleRemoveVariantUpload = (variantId, previewIndex) => {
        if (!variantId || previewIndex < 0) return;
        setVariantImageFiles((prev) => ({
            ...prev,
            [variantId]: (prev[variantId] || []).filter((_, index) => index !== previewIndex)
        }));
        setVariantImagePreviews((prev) => ({
            ...prev,
            [variantId]: (prev[variantId] || []).filter((_, index) => index !== previewIndex)
        }));
        setFormData(prev => ({ ...prev, imageIntegrityConfirmed: false }));
    };

    const handleRemoveSavedVariantImage = (variantId, imageUrl) => {
        if (!variantId || !imageUrl) return;
        setFormData((prev) => ({
            ...prev,
            imageIntegrityConfirmed: false,
            variants: prev.variants.map((variant) => {
                if (variant.id !== variantId) return variant;
                return {
                    ...variant,
                    variantImages: Array.isArray(variant.variantImages)
                        ? variant.variantImages.filter((img) => img !== imageUrl)
                        : []
                };
            })
        }));
    };

    const addVariantFaq = (variantId) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => {
                if (v.id !== variantId) return v;
                const current = Array.isArray(v.variantFaqs) ? v.variantFaqs : [];
                return { ...v, variantFaqs: [...current, { question: '', answer: '' }] };
            })
        }));
    };

    const removeVariantFaq = (variantId, faqIndex) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => {
                if (v.id !== variantId) return v;
                const current = Array.isArray(v.variantFaqs) ? v.variantFaqs : [];
                return { ...v, variantFaqs: current.filter((_, i) => i !== faqIndex) };
            })
        }));
    };

    const handleVariantFaqChange = (variantId, faqIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => {
                if (v.id !== variantId) return v;
                const current = Array.isArray(v.variantFaqs) ? v.variantFaqs : [];
                const next = current.map((faq, i) => i === faqIndex ? { ...faq, [field]: value } : faq);
                return { ...v, variantFaqs: next };
            })
        }));
    };

    const clearVariantFaqOverride = (variantId) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(variant => (
                variant.id === variantId ? { ...variant, variantFaqs: [] } : variant
            ))
        }));
    };

    const addFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { question: '', answer: '' }]
        }));
    };

    const removeFaq = (index) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const handleFaqChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = "Product Name is required";
        } else if (!/^[a-zA-Z0-9 ]+$/.test(formData.name)) {
            newErrors.name = "Product Name must contain only alphanumeric characters and spaces";
        }
        if (!formData.categories?.[0]?.category) newErrors.categories = "Category is required";

        const strippedDesc = (formData.description || '').replace(/<[^>]*>/g, '').trim();
        if (!strippedDesc) newErrors.description = "Product Description is required";

        if (formData.material === 'Gems' && !String(formData.gemstoneType || '').trim()) {
            newErrors.gemstoneType = "Gemstone type is required for Gems products";
        }
        if (formData.material === 'Gems' && !formData.settingMetal) newErrors.settingMetal = "Setting metal is required";
        if (formData.material === 'Gems' && !formData.settingPurity) newErrors.settingPurity = "Setting purity is required";
        if (formData.material === 'Gems' && !(formData.gemstones || []).length) newErrors.gemstones = "At least one verified gemstone/material entry is required";
        if (formData.material === 'Gems' && ['Ruby', 'Emerald', 'Sapphire'].includes(formData.gemstoneType) && !formData.sourceDocumentationConfirmed) {
            newErrors.sourceDocumentationConfirmed = "Source documentation is required for this gemstone claim";
        }
        if (formData.material === 'Gold' && !formData.goldCategory) newErrors.goldCategory = "Gold purity is required";
        if (formData.material === 'Gold' && !formData.goldTone) newErrors.goldTone = "Gold tone is required";
        if (formData.material === 'Silver' && !formData.silverCategory) newErrors.silverCategory = "Silver purity is required";
        if (formData.material === 'Diamond') {
            if (!formData.diamondType || formData.diamondType === 'none') newErrors.diamondType = "Diamond origin is required";
            if (!formData.settingMetal) newErrors.settingMetal = "Setting metal is required";
            if (!formData.settingPurity) newErrors.settingPurity = "Setting purity is required";
            if (!formData.sourceDocumentationConfirmed) newErrors.sourceDocumentationConfirmed = "Source documentation confirmation is required for Diamond products";
        }
        if (formData.status === 'Active' && !formData.imageIntegrityConfirmed) {
            newErrors.imageIntegrityConfirmed = "Confirm that the images show this exact product before publishing";
        }
        if (formData.status === 'Active' && previewImages.length === 0) {
            newErrors.images = "At least one original product image is required before publishing";
        }
        const pricingConfigurationError = formData.status === 'Active'
            ? getPricingConfigurationError(formData, metalRates)
            : '';
        if (pricingConfigurationError) newErrors.pricingConfiguration = pricingConfigurationError;

        formData.variants.forEach((v, i) => {
            const varLabel = v.name ? `Variant "${v.name}"` : `Variant #${i + 1}`;
            if (!v.name) newErrors[`variant_${i}_name`] = `${varLabel}: Name is required`;
            if (!v.weight) newErrors[`variant_${i}_weight`] = `${varLabel}: Weight is required`;
            if (formData.status === 'Active' && Number(v.stock) <= 0) newErrors[`variant_${i}_stock`] = `${varLabel}: Positive stock is required before publishing`;
            if (formData.material === 'Diamond' && !v.diamondPricing?.enabled && !(Number(v.diamondPrice) > 0)) {
                newErrors[`variant_${i}_diamondPrice`] = `${varLabel}: Diamond pricing is required`;
            }
            if (formData.material === 'Gems' && !(v.gemstonePricing || []).length && !(Number(v.diamondPrice) > 0)) {
                newErrors[`variant_${i}_diamondPrice`] = `${varLabel}: Gemstone pricing is required`;
            }
            const pricing = getPricingForVariant(v, formData, metalRates, gstRate);
            if (formData.status === 'Active' && pricing.finalPrice <= 0) {
                newErrors[`variant_${i}_price`] = `${varLabel}: Final price must be greater than ₹0`;
            }
        });

        const combined = { ...liveErrors, ...newErrors };
        setErrors(combined);
        return combined;
    };

    const handleSubmit = async () => {
        setHasTriedSubmit(true);
        const newErrors = validateForm();
        const errorList = Object.values(newErrors);

        if (errorList.length > 0) {
            toast.error(
                <div className="text-left font-sans">
                    <p className="font-bold text-sm text-red-700">Validation Error</p>
                    <ul className="list-disc pl-4 mt-2 text-xs text-gray-700 space-y-1">
                        {errorList.slice(0, 5).map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                        {errorList.length > 5 && <li>...and {errorList.length - 5} more issues</li>}
                    </ul>
                </div>,
                { duration: 6000 }
            );

            // Redirect to step containing error
            if (['name', 'categories', 'audience'].some(k => k in newErrors)) {
                setActiveTab('identity');
            } else if (['goldCategory', 'goldTone', 'silverCategory', 'diamondType', 'settingMetal', 'settingPurity', 'gemstoneType', 'gemstones', 'sourceDocumentationConfirmed', 'huid'].some(k => k in newErrors)) {
                setActiveTab('material');
            } else if (['pricingConfiguration'].some(k => k in newErrors) || Object.keys(newErrors).some(k => k.includes('_price') || k.includes('_diamondPrice'))) {
                setActiveTab('pricing');
            } else if (Object.keys(newErrors).some(k => k.includes('_stock'))) {
                setActiveTab('inventory');
            } else if (['images', 'imageIntegrityConfirmed'].some(k => k in newErrors)) {
                setActiveTab('media');
            } else if (['description'].some(k => k in newErrors)) {
                setActiveTab('content');
            } else {
                setActiveTab('review');
            }
            return;
        }

        setIsSaving(true);
        try {
            const productForm = new FormData();
            const payload = { ...formData };

            if (payload.logistics) {
                payload.logistics = {
                    ...payload.logistics,
                    estimatedShippingDays: (payload.logistics.estimatedShippingDays === '' || payload.logistics.estimatedShippingDays === undefined || payload.logistics.estimatedShippingDays === null)
                        ? 3
                        : parseInt(payload.logistics.estimatedShippingDays)
                };
            }
            const cleanVariants = payload.variants.map(v => {
                const { id: _, ...rest } = v;
                return rest;
            });
            const categoryIds = (payload.categories || [])
                .map((entry) => {
                    if (!entry) return '';
                    if (typeof entry === 'string') return entry;
                    return entry.category || entry._id || entry.id || '';
                })
                .filter(Boolean)
                .slice(0, 1);

            productForm.append('name', payload.name);
            productForm.append('productCode', payload.productCode || '');
            productForm.append('huid', payload.huid || '');
            productForm.append('material', payload.material || 'Gold');
            productForm.append('goldTone', payload.goldTone || '');
            productForm.append('gemstoneType', payload.gemstoneType || '');
            productForm.append('gemstones', JSON.stringify(payload.gemstones || []));
            productForm.append('imageIntegrityConfirmed', String(Boolean(payload.imageIntegrityConfirmed)));
            productForm.append('sourceDocumentationConfirmed', String(Boolean(payload.sourceDocumentationConfirmed)));
            productForm.append('description', payload.description || '');
            productForm.append('specifications', payload.specifications || '');
            productForm.append('supplierInfo', payload.supplierInfo || '');
            productForm.append('stylingTips', payload.stylingTips || '');
            productForm.append('careTips', payload.careTips || '');
            const primaryVariant = payload.variants[0] || {};
            productForm.append('diamondType', payload.diamondType || primaryVariant.diamondType || 'none');
            productForm.append('categories', JSON.stringify(categoryIds));
            productForm.append('audience', JSON.stringify(payload.audience || ['unisex']));
            productForm.append('weight', primaryVariant.weight || '');
            productForm.append('weightUnit', primaryVariant.weightUnit || 'Grams');
            productForm.append('paymentGatewayChargeBearer', payload.paymentGatewayChargeBearer || 'store');
            productForm.append('silverCategory', payload.silverCategory || '');
            productForm.append('goldCategory', payload.goldCategory || '');
            productForm.append('settingMetal', payload.settingMetal || '');
            productForm.append('settingPurity', payload.settingPurity || '');
            productForm.append('cardLabel', payload.cardLabel || '');
            productForm.append('cardBadge', payload.cardBadge || '');
            productForm.append('status', payload.status || 'Active');
            productForm.append('showInNavbar', (payload.showInNavbar ?? true).toString());
            productForm.append('showInCollection', (payload.showInCollection ?? true).toString());
            productForm.append('active', (payload.active ?? true).toString());
            productForm.append('isSerialized', 'true');
            productForm.append('variants', JSON.stringify(cleanVariants));
            productForm.append('faqs', JSON.stringify(payload.faqs || []));
            productForm.append('tags', JSON.stringify(payload.tags || {}));
            productForm.append('seo', JSON.stringify(payload.seo || {}));
            productForm.append('logistics', JSON.stringify(payload.logistics || {}));
            productForm.append('relatedProducts', JSON.stringify(payload.relatedProducts || []));
            productForm.append('deletedImages', JSON.stringify(payload.deletedImages || []));
            productForm.append('removeVideo', removeVideo.toString());

            imageFiles.forEach(file => productForm.append('images', file));
            if (videoFile) productForm.append('video', videoFile);

            payload.variants.forEach((variant, index) => {
                const key = variant.id;
                (variantImageFiles[key] || []).forEach(file => {
                    productForm.append(`variantImages_${index}`, file);
                });
            });

            let response;
            if (isEditMode) {
                response = await resolvedProductApi.updateProduct(id, productForm);
            } else {
                response = await resolvedProductApi.createProduct(productForm);
            }

            if (response) {
                toast.success(isEditMode ? "Product updated successfully" : "Product created successfully");
                if (!isEditMode) {
                    localStorage.removeItem(storageKey);
                    localStorage.removeItem('sands_admin_add_product_form');
                }
                setCreatedProductData(response.data?.data || response.data || response);
                setShowSuccessModal(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to save product");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-md">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#3E2723]/10 border-t-[#3E2723] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutDashboard className="text-[#3E2723] animate-pulse" size={22} />
                    </div>
                </div>
                <p className="mt-5 text-[11px] font-bold text-[#3E2723] uppercase tracking-widest animate-pulse">Loading Product Manifest...</p>
            </div>
        );
    }

    const currentStepIndex = STEPS.findIndex(s => s.id === activeTab);
    const prevStep = currentStepIndex > 0 ? STEPS[currentStepIndex - 1] : null;
    const nextStep = currentStepIndex < STEPS.length - 1 ? STEPS[currentStepIndex + 1] : null;

    return (
        <div className="min-h-screen bg-[#FDFBF7]/40 pb-24">
            {/* STICKY TOP APP BAR */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <button
                                onClick={() => navigate(backPath)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#3E2723] hover:bg-white transition-all shadow-xs"
                                title="Back to Products"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                        {isEditMode ? 'Edit Product' : (isViewMode ? 'View Product' : 'New Product Registration')}
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold">
                                        {formData.productCode || (isEditMode ? 'ALAN-001' : 'NEW')}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    Alankar JEWELLERS • Master Registry Protocol
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2.5">
                            {!isViewMode && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-[#3E2723] hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <SuccessIcon size={14} />}
                                    <span>{isEditMode ? 'Update Product' : 'Save Product'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 8-STEP MODERN STEPPER NAV BAR */}
                <div className="border-t border-gray-100 bg-[#FAFAFA]/90">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
                            {STEPS.map((step) => {
                                const isActive = activeTab === step.id;
                                const StepIcon = step.icon;
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveTab(step.id)}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                                            ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 font-bold'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-[#3E2723] text-white' : 'bg-gray-200/70 text-gray-600'
                                            }`}>
                                            {step.stepNumber}
                                        </div>
                                        <StepIcon size={13} className={isActive ? 'text-amber-800' : 'text-gray-400'} />
                                        <span>{step.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT WORKSPACE */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-6">
                {activeTab === 'identity' && (
                    <Step1ProductIdentity
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        categories={categories}
                        isViewMode={isViewMode}
                        handleCategoryChange={(val) => setFormData(prev => ({ ...prev, categories: [{ category: val }] }))}
                    />
                )}

                {activeTab === 'material' && (
                    <Step2ProductMaterial
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                    />
                )}

                {activeTab === 'pricing' && (
                    <Step3ProductPricing
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                        metalRates={metalRates}
                        gstRate={gstRate}
                        rateSourceInfo={rateSourceInfo}
                        handleVariantChange={handleVariantChange}
                        handleDiamondSpecChange={handleDiamondSpecChange}
                        addVariant={addVariant}
                        removeVariant={removeVariant}
                        activeVariantIndex={activeVariantIndex}
                        setActiveVariantIndex={setActiveVariantIndex}
                    />
                )}

                {activeTab === 'inventory' && (
                    <Step4ProductInventory
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                        updateVariantSerialQuantity={updateVariantSerialQuantity}
                        activeVariantIndex={activeVariantIndex}
                        setActiveVariantIndex={setActiveVariantIndex}
                    />
                )}

                {activeTab === 'barcode' && (
                    <Step5ProductBarcode
                        formData={formData}
                        isViewMode={isViewMode}
                        handleDownloadSerialBarcode={handleDownloadSerialBarcode}
                        handleDownloadAllSerialBarcodes={handleDownloadAllSerialBarcodes}
                        setSerialBarcodeRef={setSerialBarcodeRef}
                        activeVariantIndex={activeVariantIndex}
                        setActiveVariantIndex={setActiveVariantIndex}
                    />
                )}

                {activeTab === 'media' && (
                    <Step6ProductMedia
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                        previewImages={previewImages}
                        handleImageUpload={handleImageUpload}
                        handleHoverImageUpload={handleHoverImageUpload}
                        handleRemoveImage={handleRemoveImage}
                        handleVideoUpload={handleVideoUpload}
                        handleRemoveVideo={handleRemoveVideo}
                        resolvedVideoPreview={resolvedVideoPreview}
                        isImageVideoPreview={isImageVideoPreview}
                        removeVideo={removeVideo}
                        handleVariantImageUpload={handleVariantImageUpload}
                        handleRemoveVariantUpload={handleRemoveVariantUpload}
                        variantImagePreviews={variantImagePreviews}
                        handleRemoveSavedVariantImage={handleRemoveSavedVariantImage}
                        activeVariantIndex={activeVariantIndex}
                        setActiveVariantIndex={setActiveVariantIndex}
                    />
                )}

                {activeTab === 'content' && (
                    <Step7ProductContent
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                        addFaq={addFaq}
                        removeFaq={removeFaq}
                        handleFaqChange={handleFaqChange}
                        addVariantFaq={addVariantFaq}
                        removeVariantFaq={removeVariantFaq}
                        handleVariantFaqChange={handleVariantFaqChange}
                        clearVariantFaqOverride={clearVariantFaqOverride}
                        activeVariantIndex={activeVariantIndex}
                        setActiveVariantIndex={setActiveVariantIndex}
                    />
                )}

                {activeTab === 'review' && (
                    <Step8ProductReview
                        formData={formData}
                        setFormData={setFormData}
                        errors={combinedErrors}
                        isViewMode={isViewMode}
                        isSaving={isSaving}
                        handleSubmit={handleSubmit}
                        metalRates={metalRates}
                        gstRate={gstRate}
                        previewImages={previewImages}
                        setActiveTab={setActiveTab}
                        isEditMode={isEditMode}
                    />
                )}

                {/* BOTTOM NAVIGATION FOOTER */}
                <div className="mt-10 pt-6 border-t border-gray-200/80 flex items-center justify-between">
                    <div>
                        {prevStep ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(prevStep.id)}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                            >
                                <ArrowLeft size={14} />
                                <span>Previous: Step {prevStep.stepNumber} ({prevStep.label})</span>
                            </button>
                        ) : <div />}
                    </div>

                    <div>
                        {nextStep ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(nextStep.id)}
                                className="px-5 py-2.5 rounded-xl bg-[#3E2723] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                            >
                                <span>Next: Step {nextStep.stepNumber} ({nextStep.label})</span>
                                <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl bg-[#3E2723] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                            >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <SuccessIcon size={14} />}
                                <span>{isEditMode ? 'Update Product' : 'Commit & Publish'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row">
                        <div className="md:w-1/2 bg-[#3E2723] p-8 flex flex-col justify-between text-white">
                            <div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6">
                                    <SuccessIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold leading-tight mb-2">
                                    Product Successfully Committed
                                </h3>
                                <p className="text-amber-200/80 text-xs">Synchronized with Alankar JEWELLERS Central Registry</p>
                            </div>

                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Master Product Code</p>
                                <span className="text-2xl font-mono font-bold text-amber-400">
                                    {createdProductData?.productCode || formData.productCode || 'COMMITTED'}
                                </span>
                            </div>
                        </div>

                        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-white">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Registered Piece</p>
                                    <h2 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">{formData.name}</h2>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Visual Barcode Signature</p>
                                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                                        <Barcode
                                            value={createdProductData?.productCode || formData.productCode || 'COMMITTED'}
                                            width={1.2}
                                            height={40}
                                            fontSize={10}
                                            background="#ffffff"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5 mt-8">
                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        if (isAdminMode) navigate('/admin/products/new');
                                        else window.location.reload();
                                    }}
                                    className="w-full py-3 bg-[#3E2723] text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} /> Add Another Product
                                </button>
                                <button
                                    onClick={() => navigate(backPath)}
                                    className="w-full py-2.5 text-gray-500 rounded-xl text-xs font-semibold hover:text-[#3E2723] transition-all"
                                >
                                    Return to Product Catalog
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedProductEditor;
