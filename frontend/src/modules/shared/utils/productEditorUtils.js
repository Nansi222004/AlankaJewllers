/**
 * Utility functions and constants for Product Editor
 */

export const ENHANCEMENT_PROMPT = "Enhance this product image for eCommerce use. Improve lighting, sharpness, remove background noise, make it look professional, high resolution, clean white or premium background, realistic colors, suitable for online store listing.";

export const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

export const IMAGE_PREVIEW_RE = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i;

export const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

export const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link'
];

export const normalizeSerialCodes = (codes) => {
    if (!Array.isArray(codes)) return [];
    return codes
        .map(code => {
            if (typeof code === 'string') return { code, status: 'AVAILABLE' };
            if (code && typeof code === 'object' && code.code) {
                return { code: String(code.code), status: code.status || 'AVAILABLE' };
            }
            return null;
        })
        .filter(Boolean);
};

export const getAvailableSerialCodes = (variant) =>
    (variant.serialCodes || []).filter(code => (code.status || 'AVAILABLE') === 'AVAILABLE');

export const normalizeString = (value = '') => String(value || '').trim().toLowerCase();

export const getTenGramRate = (formData, metalRates) => {
    const material = normalizeString(formData.material);
    const settingMetal = normalizeString(formData.settingMetal);

    const isStoneSetProduct = material === 'diamond' || material === 'gems';

    if (material === 'gold' || (isStoneSetProduct && (settingMetal === 'gold' || settingMetal === 'white gold' || settingMetal === 'rose gold'))) {
        const goldCategory = normalizeString(formData.goldCategory || formData.settingPurity);
        const gold10g = metalRates.gold10g || {};
        const fallback = Number(metalRates.goldPerGram || 0) * 10;

        if (goldCategory.includes('14')) return Number(gold10g.k14) || fallback;
        if (goldCategory.includes('18')) return Number(gold10g.k18) || fallback;
        if (goldCategory.includes('22')) return Number(gold10g.k22) || fallback;
        if (goldCategory.includes('24')) return Number(gold10g.k24) || fallback;

        return Number(gold10g.k18) || Number(gold10g.k22) || Number(gold10g.k14) || Number(gold10g.k24) || fallback;
    }

    if (material === 'silver' || (isStoneSetProduct && settingMetal === 'silver')) {
        const silverCategory = normalizeString(formData.silverCategory || formData.settingPurity);
        const silver10g = metalRates.silver10g || {};
        const fallback = Number(metalRates.silverPerGram || 0) * 10;
        const isSterling = silverCategory.includes('sterling') || silverCategory.includes('925');

        if (isSterling) return Number(silver10g.sterling925) || fallback;
        return Number(silver10g.silverOther) || fallback;
    }

    if (isStoneSetProduct && settingMetal === 'platinum') {
        return Number(metalRates.platinum10g?.pt950) || Number(metalRates.platinumPerGram || 0) * 10;
    }

    return 0;
};

export const getPricingConfigurationError = (formData, metalRates) => {
    const material = normalizeString(formData.material);
    const settingMetal = normalizeString(formData.settingMetal);
    const requiresMetalRate = material === 'gold'
        || material === 'silver'
        || (['diamond', 'gems'].includes(material) && ['gold', 'white gold', 'rose gold', 'silver', 'platinum'].includes(settingMetal));

    if (requiresMetalRate && getTenGramRate(formData, metalRates) <= 0) {
        const purity = ['Diamond', 'Gems'].includes(formData.material)
            ? formData.settingPurity
            : (formData.goldCategory || formData.silverCategory);
        return `Pricing configuration required for ${purity || 'this purity'}.`;
    }
    return '';
};

export const getMetalRate = (variant, formData, metalRates) => {
    const unit = String(variant?.weightUnit || formData.weightUnit || 'Grams').toLowerCase();
    const perTenGram = Number(getTenGramRate(formData, metalRates)) || 0;
    const perGram = perTenGram / 10;
    const perMilligram = perGram / 1000;
    if (unit === 'milligrams' || unit === 'milligram') {
        return perMilligram;
    }
    return perGram;
};

export const getMetalPrice = (variant, formData, metalRates) => {
    const variantWeight = variant?.weight !== undefined && variant?.weight !== null && variant?.weight !== ""
        ? Number(variant.weight) || 0
        : Number(formData.weight) || 0;
    return roundCurrency(variantWeight * getMetalRate(variant, formData, metalRates));
};

export const getPaymentGatewayChargePercent = (formData) => (
    String(formData.paymentGatewayChargeBearer || 'store').toLowerCase() === 'user' ? 2 : 0
);

/**
 * resolveDiamondPriceFrontend - mirrors backend resolveDiamondPrice.
 * Admin-Controlled ONLY. No market lookup.
 * When diamondPricing.enabled=true: uses new sub-object.
 * Otherwise: falls back to legacy flat diamondPrice field.
 */
export const resolveDiamondPriceFrontend = (variant = {}) => {
    const dp = variant.diamondPricing || {};
    const legacyDiamondPrice = roundCurrency(Number(variant.diamondPrice) || 0);
    const legacyCertCharge = roundCurrency(Number(variant.diamondCertificateCharge) || 0);

    if (!dp.enabled) {
        return { resolvedDiamondPrice: legacyDiamondPrice, resolvedCertificateCharge: legacyCertCharge };
    }

    const certCharge = roundCurrency(Number(dp.certificateCharge) || 0);
    const mode = String(dp.pricingMode || 'total').toLowerCase();
    let price = 0;

    if (mode === 'per_carat') {
        const caratValue = parseFloat(String(variant.diamondSpecs?.carat || '0')) || 0;
        price = roundCurrency(caratValue * (Number(dp.pricePerCarat) || 0));
    } else {
        price = roundCurrency(Number(dp.totalPrice) || 0);
    }

    return { resolvedDiamondPrice: price, resolvedCertificateCharge: certCharge };
};

/**
 * resolveGemstonePriceFrontend - mirrors backend resolveGemstonePrice.
 * Admin-Controlled ONLY. Gemstone type does NOT auto-generate a market price.
 */
export const resolveGemstonePriceFrontend = (variant = {}) => {
    const stones = Array.isArray(variant.gemstonePricing) ? variant.gemstonePricing : [];
    if (stones.length === 0) return { resolvedGemstonePrice: 0, resolvedGemstoneCertCharge: 0 };

    let totalGemstonePrice = 0;
    let totalCertCharge = 0;

    for (const stone of stones) {
        const mode = String(stone.pricingMode || 'total').toLowerCase();
        let stonePrice = 0;
        if (mode === 'per_carat') {
            stonePrice = roundCurrency((Number(stone.weight) || 0) * (Number(stone.pricePerCarat) || 0));
        } else {
            stonePrice = roundCurrency(Number(stone.totalPrice) || 0);
        }
        totalGemstonePrice += stonePrice;
        totalCertCharge += roundCurrency(Number(stone.certificateCharge) || 0);
    }

    return {
        resolvedGemstonePrice: roundCurrency(totalGemstonePrice),
        resolvedGemstoneCertCharge: roundCurrency(totalCertCharge)
    };
};

export const getPricingForVariant = (variant, formData, metalRates, gstRate) => {
    const metalPrice = getMetalPrice(variant, formData, metalRates);
    const makingCharge = roundCurrency(Number(variant.makingCharge) || 0);

    // Diamond price — Admin-Controlled, resolved from new sub-object or legacy field
    const { resolvedDiamondPrice, resolvedCertificateCharge } = resolveDiamondPriceFrontend(variant);
    const material = normalizeString(formData.material);
    const hasStructuredDiamond = variant.diamondPricing?.enabled === true;
    const hasStructuredGemstones = Array.isArray(variant.gemstonePricing) && variant.gemstonePricing.length > 0;
    const usesLegacyGemstoneAmount = material === 'gems' && !hasStructuredDiamond && !hasStructuredGemstones;
    const diamondPrice = roundCurrency(
        usesLegacyGemstoneAmount || (hasStructuredGemstones && !hasStructuredDiamond)
            ? 0
            : resolvedDiamondPrice
    );

    // Gemstone price — Admin-Controlled, never from API Mitra
    const { resolvedGemstonePrice, resolvedGemstoneCertCharge } = resolveGemstonePriceFrontend(variant);
    const gemstonePrice = roundCurrency(usesLegacyGemstoneAmount ? resolvedDiamondPrice : resolvedGemstonePrice);

    const hallmarkingCharge = roundCurrency(Number(variant.hallmarkingCharge) || 0);
    const diamondCertificateCharge = usesLegacyGemstoneAmount ? 0 : resolvedCertificateCharge;
    const gemstoneCertificateCharge = roundCurrency(
        resolvedGemstoneCertCharge + (usesLegacyGemstoneAmount ? resolvedCertificateCharge : 0)
    );
    const additionalCharge = roundCurrency(Number(variant.additionalCharge) || 0);

    const hiddenCharge = roundCurrency(
        hallmarkingCharge + diamondCertificateCharge + gemstoneCertificateCharge + additionalCharge
    );
    const subtotalBeforeTax = roundCurrency(
        metalPrice + makingCharge + diamondPrice + gemstonePrice + hiddenCharge
    );
    const gstValue = roundCurrency((subtotalBeforeTax * (Number(gstRate) || 0)) / 100);
    const priceAfterTax = roundCurrency(subtotalBeforeTax + gstValue);
    const pgChargePercent = getPaymentGatewayChargePercent(formData);
    const pgChargeAmount = roundCurrency((priceAfterTax * pgChargePercent) / 100);
    const finalPrice = roundCurrency(priceAfterTax + pgChargeAmount);

    return {
        metalPrice,
        makingCharge,
        diamondPrice,
        gemstonePrice,
        diamondCertificateCharge,
        gemstoneCertificateCharge,
        hallmarkingCharge,
        additionalCharge,
        hiddenCharge,
        subtotalBeforeTax,
        gstValue,
        priceAfterTax,
        pgChargePercent,
        pgChargeAmount,
        finalPrice
    };
};

export const generateSerialCode = (existingSet, variantIndex, prefix) => {
    let attempt = 0;
    while (attempt < 50) {
        const suffix = `${String(variantIndex + 1).padStart(2, '0')}${Date.now().toString().slice(-4)}${String(Math.floor(Math.random() * 900)).padStart(3, '0')}`;
        const code = `${prefix}${suffix}`;
        if (!existingSet.has(code)) return code;
        attempt += 1;
    }
    return `${prefix}${Date.now().toString().slice(-10)}`;
};

export const syncVariantSerialQuantity = (variant, variantIndex, desiredCount, prefix) => {
    const normalized = normalizeSerialCodes(variant.serialCodes || []);
    const available = normalized.filter(code => (code.status || 'AVAILABLE') === 'AVAILABLE');
    const sold = normalized.filter(code => (code.status || 'AVAILABLE') !== 'AVAILABLE');
    const existingSet = new Set(normalized.map(code => code.code));

    let updatedAvailable = [...available];
    if (desiredCount > available.length) {
        const toAdd = desiredCount - available.length;
        for (let i = 0; i < toAdd; i += 1) {
            const code = generateSerialCode(existingSet, variantIndex, prefix);
            existingSet.add(code);
            updatedAvailable.push({ code, status: 'AVAILABLE' });
        }
    } else if (desiredCount < available.length) {
        updatedAvailable = available.slice(0, desiredCount);
    }

    return {
        ...variant,
        serialCodes: [...sold, ...updatedAvailable],
        stock: desiredCount
    };
};
