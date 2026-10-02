const roundCurrency = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

/**
 * The merchandise amount used by the existing checkout rule is the product
 * subtotal after coupon discount, plus gift wrap. A free-shipping coupon wins
 * over every other rule. A non-positive threshold disables threshold-based
 * free shipping; setting shippingCharges to zero still provides free shipping.
 */
const calculateShippingQuote = ({
  subtotal = 0,
  discount = 0,
  giftWrapCharge = 0,
  isFreeShipping = false,
  settings = {},
} = {}) => {
  const shippingCharges = Math.max(0, Number(settings.shippingCharges) || 0);
  const freeShippingThreshold = Math.max(
    0,
    Number(settings.freeShippingThreshold) || 0,
  );
  const thresholdAmount = roundCurrency(
    Math.max(0, Number(subtotal) - Number(discount) + Number(giftWrapCharge)),
  );
  const thresholdReached =
    freeShippingThreshold > 0 && thresholdAmount > freeShippingThreshold;

  let reason = "configured_rate";
  let shipping = shippingCharges;
  if (isFreeShipping) {
    shipping = 0;
    reason = "free_shipping_coupon";
  } else if (thresholdReached) {
    shipping = 0;
    reason = "free_shipping_threshold";
  } else if (shippingCharges === 0) {
    reason = "configured_free_shipping";
  }

  return {
    shipping: roundCurrency(shipping),
    shippingCharges: roundCurrency(shippingCharges),
    freeShippingThreshold: roundCurrency(freeShippingThreshold),
    thresholdAmount,
    thresholdReached,
    isFreeShipping: shipping === 0,
    reason,
  };
};

module.exports = { calculateShippingQuote, roundCurrency };
