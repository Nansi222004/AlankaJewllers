const mongoose = require("mongoose");

const PRICE_UNAVAILABLE_MESSAGE =
  "This product is currently available on request. Please contact us for the latest price.";

class CheckoutValidationError extends Error {
  constructor(message, code, statusCode = 400, details = undefined) {
    super(message);
    this.name = "CheckoutValidationError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

const normalizeQuantity = (value) => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CheckoutValidationError(
      "Item quantity must be a positive whole number.",
      "INVALID_QUANTITY",
    );
  }
  return quantity;
};

const assertValidProductAndVariantIds = (productId, variantId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new CheckoutValidationError("Invalid product id.", "INVALID_PRODUCT_ID");
  }
  if (!mongoose.Types.ObjectId.isValid(variantId)) {
    throw new CheckoutValidationError("Invalid variant id.", "INVALID_VARIANT_ID");
  }
};

const assertPurchasableVariant = ({ product, variant, quantity }) => {
  const normalizedQuantity = normalizeQuantity(quantity);
  const price = Number(variant?.price);

  if (!Number.isFinite(price) || price <= 0) {
    throw new CheckoutValidationError(
      PRICE_UNAVAILABLE_MESSAGE,
      "PRICE_UNAVAILABLE",
      422,
      {
        productId: product?._id ? String(product._id) : undefined,
        variantId: variant?._id ? String(variant._id) : undefined,
        productName: product?.name,
      },
    );
  }

  const stock = Number(variant?.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    throw new CheckoutValidationError(
      `Stock is unavailable for ${product?.name || "this product"}.`,
      "STOCK_UNAVAILABLE",
    );
  }
  if (stock < normalizedQuantity) {
    throw new CheckoutValidationError(
      `Insufficient stock for ${product?.name || "this product"} (${variant?.name || "variant"})`,
      "INSUFFICIENT_STOCK",
    );
  }

  return { price, stock, quantity: normalizedQuantity };
};

const assertImmutableOrderItemsPriced = (items = []) => {
  for (const item of items) {
    const isGift = item?.isGiftCard || String(item?.productId || "").startsWith("GIFT_CARD_");
    if (isGift) continue;
    normalizeQuantity(item?.quantity);
    const price = Number(item?.price);
    if (!Number.isFinite(price) || price <= 0) {
      throw new CheckoutValidationError(
        PRICE_UNAVAILABLE_MESSAGE,
        "PRICE_UNAVAILABLE",
        422,
      );
    }
  }
};

module.exports = {
  PRICE_UNAVAILABLE_MESSAGE,
  CheckoutValidationError,
  normalizeQuantity,
  assertValidProductAndVariantIds,
  assertPurchasableVariant,
  assertImmutableOrderItemsPriced,
};
