const normalize = (value) => String(value || "").trim().toLowerCase();
const money = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getEffectiveStoneValues = (product = {}, variant = {}) => {
  const material = normalize(product.material);
  const structuredDiamond = variant.diamondPricing?.enabled === true;
  const structuredGemstones =
    Array.isArray(variant.gemstonePricing) && variant.gemstonePricing.length > 0;
  const legacyGems = material === "gems" && !structuredDiamond && !structuredGemstones;

  return {
    diamondPrice: money(
      legacyGems || (structuredGemstones && !structuredDiamond)
        ? 0
        : variant.diamondPrice,
    ),
    gemstonePrice: money(
      legacyGems
        ? (variant.gemstonePrice ?? variant.diamondPrice)
        : variant.gemstonePrice,
    ),
    diamondCertificateCharge: money(
      legacyGems ? 0 : variant.diamondCertificateCharge,
    ),
    gemstoneCertificateCharge: money(
      legacyGems
        ? (variant.gemstoneCertificateCharge ?? variant.diamondCertificateCharge)
        : variant.gemstoneCertificateCharge,
    ),
  };
};

const buildOrderItemPricingSnapshot = (product = {}, variant = {}) => {
  const weight = Number(variant.weight ?? product.weight) || 0;
  const weightUnit = variant.weightUnit || product.weightUnit || "Grams";
  const metalValue = money(variant.metalPrice);
  const taxableSubtotal = money(variant.subtotalBeforeTax);
  const gstAmount = money(variant.gstAmount ?? variant.gst);
  const stone = getEffectiveStoneValues(product, variant);
  const material = String(product.material || "");
  const settingBased = ["diamond", "gems"].includes(normalize(material));
  const metal = settingBased ? product.settingMetal : material;
  const purity = settingBased
    ? product.settingPurity
    : normalize(material) === "gold"
      ? `${product.goldCategory || ""}K`
      : product.silverCategory || product.goldCategory || "";

  return {
    weight,
    weightUnit,
    metal: metal || "",
    purity: purity || "",
    metalRate: weight > 0 ? money(metalValue / weight) : 0,
    metalValue,
    makingCharge: money(variant.makingCharge),
    diamondPrice: stone.diamondPrice,
    gemstonePrice: stone.gemstonePrice,
    hallmarkingCharge: money(variant.hallmarkingCharge),
    diamondCertificateCharge: stone.diamondCertificateCharge,
    gemstoneCertificateCharge: stone.gemstoneCertificateCharge,
    additionalCharge: money(variant.additionalCharge),
    taxableSubtotal,
    gstRate:
      taxableSubtotal > 0 ? money((gstAmount / taxableSubtotal) * 100) : 0,
    gstAmount,
    pgChargePercent: money(variant.pgChargePercent),
    pgChargeAmount: money(variant.pgChargeAmount),
    finalItemPrice: money(variant.price ?? variant.finalPrice),
    mrp: money(variant.mrp ?? variant.price ?? variant.finalPrice),
  };
};

module.exports = { buildOrderItemPricingSnapshot, getEffectiveStoneValues };
