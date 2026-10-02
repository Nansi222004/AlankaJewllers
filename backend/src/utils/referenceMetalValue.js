const calculateReferenceMetalValue = ({ rate, rateUnit, netMetalWeight, weightUnit }) => {
  const numericRate = Number(rate);
  const numericWeight = Number(netMetalWeight);
  if (!Number.isFinite(numericRate) || numericRate <= 0 || !Number.isFinite(numericWeight) || numericWeight <= 0) {
    return null;
  }

  const normalizedWeightUnit = String(weightUnit || "").trim().toLowerCase();
  const normalizedRateUnit = String(rateUnit || "").trim().toLowerCase();
  if (["per_gram", "per_gram_24k"].includes(normalizedRateUnit) && ["gram", "grams", "g"].includes(normalizedWeightUnit)) {
    return numericRate * numericWeight;
  }
  if (normalizedRateUnit === "per_10g" && ["10g", "10 grams"].includes(normalizedWeightUnit)) {
    return numericRate * numericWeight;
  }
  return null;
};

module.exports = { calculateReferenceMetalValue };
