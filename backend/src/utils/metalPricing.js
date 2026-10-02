const normalizeString = (value = "") => String(value || "").trim().toLowerCase();

const resolveMaterialPayload = (materialOrProduct = {}) => {
  if (materialOrProduct && typeof materialOrProduct === "object") {
    return {
      material: materialOrProduct.material,
      goldCategory: materialOrProduct.goldCategory,
      silverCategory: materialOrProduct.silverCategory,
      settingMetal: materialOrProduct.settingMetal,
      settingPurity: materialOrProduct.settingPurity
    };
  }
  return { material: materialOrProduct };
};

const getTenGramRate = (payload = {}, rates = {}) => {
  const material = normalizeString(payload.material);
  const settingMetal = normalizeString(payload.settingMetal);

  const isStoneSetProduct = material === "diamond" || material === "gems";

  if (material === "gold" || (isStoneSetProduct && (settingMetal === "gold" || settingMetal === "white gold" || settingMetal === "rose gold"))) {
    const goldCategory = normalizeString(payload.goldCategory || payload.settingPurity);
    const gold10g = rates.gold10g || {};
    if (goldCategory.includes("14")) return Number(gold10g.k14) || Number(rates.goldPerGram || 0) * 10;
    if (goldCategory.includes("18")) return Number(gold10g.k18) || Number(rates.goldPerGram || 0) * 10;
    if (goldCategory.includes("22")) return Number(gold10g.k22) || Number(rates.goldPerGram || 0) * 10;
    if (goldCategory.includes("24")) return Number(gold10g.k24) || Number(rates.goldPerGram || 0) * 10;
    const fallbackGold10g = Number(gold10g.k18) || Number(gold10g.k22) || Number(gold10g.k14) || Number(gold10g.k24);
    return fallbackGold10g || Number(rates.goldPerGram || 0) * 10;
  }

  if (material === "silver" || (isStoneSetProduct && settingMetal === "silver")) {
    const silverCategory = normalizeString(payload.silverCategory || payload.settingPurity);
    const silver10g = rates.silver10g || {};
    const isSterling = silverCategory.includes("sterling") || silverCategory.includes("925");
    if (isSterling) return Number(silver10g.sterling925) || Number(rates.silverPerGram || 0) * 10;
    return Number(silver10g.silverOther) || Number(rates.silverPerGram || 0) * 10;
  }

  if (isStoneSetProduct && settingMetal === "platinum") {
    return Number(rates.platinum10g?.pt950) || Number(rates.platinumPerGram || 0) * 10;
  }

  return 0;
};

const getMetalRate = (materialOrProduct = "", weightUnit = "Grams", rates = {}) => {
  const unit = normalizeString(weightUnit || "Grams");
  const payload = resolveMaterialPayload(materialOrProduct);
  const perTenGram = Number(getTenGramRate(payload, rates)) || 0;
  const perGram = perTenGram / 10;
  const perMilligram = perGram / 1000;
  if (unit === "milligrams" || unit === "milligram") return perMilligram;
  return perGram;
};

const computeMetalPrice = (materialOrProduct = "", weight = 0, weightUnit = "Grams", rates = {}) => {
  const normalizedWeight = Number(weight) || 0;
  const rate = getMetalRate(materialOrProduct, weightUnit, rates);
  return normalizedWeight * rate;
};

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100;

const normalizeChargeBearer = (value = "") => {
  const normalized = normalizeString(value);
  if (normalized === "user") return "user";
  if (normalized === "seller" || normalized === "admin" || normalized === "store") return "store";
  return "store";
};

const getPaymentGatewayChargePercent = (chargeBearer = "") => (
  normalizeChargeBearer(chargeBearer) === "user" ? 2 : 0
);

/**
 * resolveDiamondPrice — Admin-Controlled ONLY. API Mitra never writes here.
 *
 * When variant.diamondPricing.enabled === true (new mode):
 *   "total"     -> resolvedDiamondPrice = diamondPricing.totalPrice
 *   "per_carat" -> resolvedDiamondPrice = diamondSpecs.carat * pricePerCarat
 *   resolvedCertificateCharge = diamondPricing.certificateCharge
 *
 * When not enabled (legacy mode):
 *   resolvedDiamondPrice   = variant.diamondPrice          (flat admin field)
 *   resolvedCertificateCharge = variant.diamondCertificateCharge
 *
 * Double-count protection: when enabled, the legacy diamondCertificateCharge
 * is REPLACED by diamondPricing.certificateCharge inside computeVariantPricing.
 */
const resolveDiamondPrice = (variant = {}) => {
  const dp = variant.diamondPricing || {};
  const legacyDiamondPrice = roundCurrency(Number(variant.diamondPrice) || 0);
  const legacyCertCharge = roundCurrency(Number(variant.diamondCertificateCharge) || 0);

  if (!dp.enabled) {
    return { resolvedDiamondPrice: legacyDiamondPrice, resolvedCertificateCharge: legacyCertCharge };
  }

  const certCharge = roundCurrency(Number(dp.certificateCharge) || 0);
  const mode = String(dp.pricingMode || "total").toLowerCase();
  let price = 0;

  if (mode === "per_carat") {
    const caratValue = parseFloat(String(variant.diamondSpecs?.carat || "0")) || 0;
    const pricePerCarat = Number(dp.pricePerCarat) || 0;
    price = roundCurrency(caratValue * pricePerCarat);
  } else {
    price = roundCurrency(Number(dp.totalPrice) || 0);
  }

  return { resolvedDiamondPrice: price, resolvedCertificateCharge: certCharge };
};

/**
 * resolveGemstonePrice — Admin-Controlled ONLY. API Mitra never writes here.
 *
 * Iterates over variant.gemstonePricing[]:
 *   "total"     -> stonePrice = stone.totalPrice
 *   "per_carat" -> stonePrice = stone.weight * stone.pricePerCarat
 *
 * gemstone type (Ruby/Emerald/Sapphire) does NOT auto-generate a market price.
 * Admin must explicitly enter a price.
 * All stone certificate charges are summed into resolvedGemstoneCertCharge.
 */
const resolveGemstonePrice = (variant = {}) => {
  const stones = Array.isArray(variant.gemstonePricing) ? variant.gemstonePricing : [];
  if (stones.length === 0) return { resolvedGemstonePrice: 0, resolvedGemstoneCertCharge: 0 };

  let totalGemstonePrice = 0;
  let totalCertCharge = 0;

  for (const stone of stones) {
    const mode = String(stone.pricingMode || "total").toLowerCase();
    let stonePrice = 0;
    if (mode === "per_carat") {
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

/**
 * computeVariantPricing — authoritative price calculation for ALL product types.
 *
 * Formula:
 *   metalPrice        = weight x metalRatePerGram         [Admin-entered rates]
 *   makingCharge      = admin input per variant
 *   diamondPrice      = resolveDiamondPrice()             [Admin-Controlled]
 *   gemstonePrice     = resolveGemstonePrice()            [Admin-Controlled]
 *   hiddenCharge      = hallmarking + diamondCert + gemstoneCerts + additional
 *   subtotalBeforeTax = metalPrice + making + diamond + gemstone + hidden
 *   gstAmount         = subtotalBeforeTax x gstRate / 100
 *   priceAfterTax     = subtotalBeforeTax + gstAmount
 *   pgChargeAmount    = priceAfterTax x pgChargePercent / 100
 *   finalPrice        = priceAfterTax + pgChargeAmount   <- checkout price
 *
 * API Mitra provides gold/silver reference rates for display only.
 * Admin-entered Setting.metalRates power the actual calculation.
 * Diamond and Gemstone pricing are NEVER derived from API Mitra.
 */
const computeVariantPricing = ({
  product = {},
  variant = {},
  rates = {},
  gstRate = 0
} = {}) => {
  const fallbackWeight = Number(product.weight) || 0;
  const fallbackWeightUnit = product.weightUnit || "Grams";
  const variantWeight = variant.weight !== undefined && variant.weight !== null
    ? Number(variant.weight) || 0
    : fallbackWeight;
  const variantWeightUnit = variant.weightUnit || fallbackWeightUnit;

  const metalPrice = roundCurrency(computeMetalPrice(product, variantWeight, variantWeightUnit, rates));
  const makingCharge = roundCurrency(Number(variant.makingCharge) || 0);

  const { resolvedDiamondPrice, resolvedCertificateCharge } = resolveDiamondPrice(variant);
  const { resolvedGemstonePrice, resolvedGemstoneCertCharge } = resolveGemstonePrice(variant);

  const material = normalizeString(product.material);
  const hasStructuredDiamond = variant.diamondPricing?.enabled === true;
  const hasStructuredGemstones = Array.isArray(variant.gemstonePricing) && variant.gemstonePricing.length > 0;
  const usesLegacyGemstoneAmount = material === "gems" && !hasStructuredDiamond && !hasStructuredGemstones;

  // Legacy Gems products stored their stone value in diamondPrice. Map that value
  // into the gemstone component without adding it twice. Once structured gemstone
  // pricing exists, it replaces that legacy amount unless diamondPricing is also
  // explicitly enabled for a product containing both diamond and gemstones.
  const diamondPrice = roundCurrency(
    usesLegacyGemstoneAmount || (hasStructuredGemstones && !hasStructuredDiamond)
      ? 0
      : resolvedDiamondPrice
  );
  const gemstonePrice = roundCurrency(
    usesLegacyGemstoneAmount ? resolvedDiamondPrice : resolvedGemstonePrice
  );
  const hallmarkingCharge = roundCurrency(Number(variant.hallmarkingCharge) || 0);
  // diamondCertificateCharge: when diamondPricing.enabled=true, resolvedCertificateCharge
  // is authoritative (from new sub-object) — prevents double-counting.
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

  const gstPercentage = Number(gstRate) || 0;
  const gstAmount = roundCurrency((subtotalBeforeTax * gstPercentage) / 100);
  const priceAfterTax = roundCurrency(subtotalBeforeTax + gstAmount);
  const pgChargePercent = getPaymentGatewayChargePercent(product.paymentGatewayChargeBearer);
  const pgChargeAmount = roundCurrency((priceAfterTax * pgChargePercent) / 100);
  const finalPrice = roundCurrency(priceAfterTax + pgChargeAmount);

  return {
    weight: variantWeight,
    weightUnit: variantWeightUnit,
    metalPrice,
    makingCharge,
    diamondPrice,
    gemstonePrice,
    hallmarkingCharge,
    diamondCertificateCharge,
    gemstoneCertificateCharge,
    additionalCharge,
    hiddenCharge,
    subtotalBeforeTax,
    gstAmount,
    priceAfterTax,
    pgChargePercent,
    pgChargeAmount,
    gst: gstAmount,
    finalPrice,
    price: finalPrice,
    mrp: finalPrice
  };
};

const applyMetalPricingToProduct = (product, rates = {}, gstRate = 0) => {
  if (!product) return product;
  product.paymentGatewayChargeBearer = normalizeChargeBearer(product.paymentGatewayChargeBearer);

  if (Array.isArray(product.variants)) {
    product.variants = product.variants.map((variant) => {
      const pricing = computeVariantPricing({ product, variant, rates, gstRate });
      const preserveLegacyGemstoneFields = normalizeString(product.material) === "gems"
        && variant.diamondPricing?.enabled !== true
        && (!Array.isArray(variant.gemstonePricing) || variant.gemstonePricing.length === 0);
      return {
        ...variant,
        ...pricing,
        ...(preserveLegacyGemstoneFields ? {
          diamondPrice: Number(variant.diamondPrice) || 0,
          diamondCertificateCharge: Number(variant.diamondCertificateCharge) || 0
        } : {})
      };
    });
  }

  return product;
};

module.exports = {
  applyMetalPricingToProduct,
  computeMetalPrice,
  computeVariantPricing,
  resolveDiamondPrice,
  resolveGemstonePrice,
  getTenGramRate,
  getMetalRate,
  getPaymentGatewayChargePercent,
  normalizeChargeBearer
};
