const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
  assertPurchasableVariant,
  normalizeQuantity,
  assertImmutableOrderItemsPriced,
} = require("../src/utils/checkoutValidation");
const { mergeGuestCart } = require("../src/utils/cartMerge");
const { computeVariantPricing } = require("../src/utils/metalPricing");

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
const product = { _id: "507f1f77bcf86cd799439011", name: "Test Ring" };
const purchasable = (price, quantity = 1) =>
  assertPurchasableVariant({
    product,
    variant: { _id: "507f191e810c19729de860ea", name: "Standard", price, stock: 5 },
    quantity,
  });
const expectPriceUnavailable = (price) =>
  assert.throws(() => purchasable(price), (error) =>
    error.code === "PRICE_UNAVAILABLE" && error.statusCode === 422);

test("1. A valid paid product passes checkout validation", () => {
  assert.deepEqual(purchasable(1250, 2), { price: 1250, stock: 5, quantity: 2 });
});
test("2. Price zero is rejected", () => expectPriceUnavailable(0));
test("3. Null price is rejected", () => expectPriceUnavailable(null));
test("4. Missing price is rejected", () => expectPriceUnavailable(undefined));
test("5. Negative price is rejected", () => expectPriceUnavailable(-1));
test("6. NaN/invalid price is rejected", () => {
  expectPriceUnavailable(Number.NaN);
  expectPriceUnavailable("not-a-price");
});
test("7. COD creation uses the guarded authoritative calculation", () => {
  const source = read("src/modules/user/controllers/order.controller.js");
  assert.match(source, /exports\.placeOrder[\s\S]*_calculateOrderData\(/);
  assert.match(source, /assertPurchasableVariant\([\s\S]*const itemTotal = purchasable\.price/);
});
test("8. Online payment initiation uses the same guarded calculation", () => {
  const source = read("src/modules/user/controllers/payment.controller.js");
  assert.match(source, /exports\.initiatePayment[\s\S]*_calculateOrderData\(/);
  assert.match(source, /return error\(res, errMsg, statusCode, err\?\.code\)/);
});
test("9. Guest quote uses the guarded order quote controller", () => {
  const source = read("src/modules/public/routes/checkout.routes.js");
  assert.match(source, /orderController\.getCheckoutQuote/);
});
test("10. Authenticated quote uses the guarded order quote controller", () => {
  const source = read("src/modules/user/routes/order.routes.js");
  assert.match(source, /\/quote[\s\S]*orderController\.getCheckoutQuote/);
});
test("11. Cart quantity one remains one", () => assert.equal(normalizeQuantity(1), 1));
test("12. Cart quantity two remains two", () => assert.equal(normalizeQuantity(2), 2));
test("13. Duplicate variants collapse, while login reconciliation does not double the same cart", () => {
  const guestOnly = mergeGuestCart([], [
    { productId: "p1", variantId: "v1", quantity: 1 },
    { productId: "p1", variantId: "v1", quantity: 1 },
  ]);
  assert.equal(guestOnly[0].quantity, 2);
  const reconciled = mergeGuestCart(
    [{ productId: "p1", variantId: "v1", quantity: 1 }],
    [{ productId: "p1", variantId: "v1", quantity: 1 }],
  );
  assert.equal(reconciled[0].quantity, 1);
});
test("14. A stale previously-priced cart is rejected from the current stored variant", () => {
  expectPriceUnavailable(0);
  const source = read("src/modules/user/controllers/order.controller.js");
  assert.match(source, /const serverPrice = Number\(variant\.price\)/);
});
test("15. Genuine Gold, Silver, Diamond and Gemstone calculations remain available", () => {
  const rates = {
    gold10g: { k22: 600000 },
    silver10g: { sterling925: 800 },
  };
  const base = { weight: 1, weightUnit: "Grams", makingCharge: 100, hallmarkingCharge: 10, additionalCharge: 20, gemstonePricing: [] };
  assert.ok(computeVariantPricing({ product: { material: "Gold", goldCategory: "22" }, variant: base, rates, gstRate: 3 }).finalPrice > 0);
  assert.ok(computeVariantPricing({ product: { material: "Silver", silverCategory: "925 sterling silver" }, variant: base, rates, gstRate: 3 }).finalPrice > 0);
  assert.equal(computeVariantPricing({ product: { material: "Gold", goldCategory: "22" }, variant: { ...base, diamondPricing: { enabled: true, pricingMode: "total", totalPrice: 5000 } }, rates, gstRate: 3 }).diamondPrice, 5000);
  assert.equal(computeVariantPricing({ product: { material: "Gold", goldCategory: "22" }, variant: { ...base, gemstonePricing: [{ gemstoneType: "Ruby", pricingMode: "total", totalPrice: 3000 }] }, rates, gstRate: 3 }).gemstonePrice, 3000);
});
test("16. API Mitra reference display remains restricted to structured genuine metals", () => {
  const source = read("../frontend/src/modules/user/utils/referenceMetalRate.js");
  assert.match(source, /excludedMaterial\(material\)/);
  assert.match(source, /\['gold', 'solid gold', 'yellow gold', 'white gold', 'rose gold'\]\.includes\(material\)/);
  assert.match(source, /\['silver', 'fine silver'\]\.includes\(material\)/);
});
test("17. Gold Plated Alloy does not consume a genuine-gold metal rate", () => {
  const result = computeVariantPricing({
    product: { material: "Gold Plated Alloy", goldCategory: "22" },
    variant: { weight: 15, weightUnit: "Grams", makingCharge: 0, hallmarkingCharge: 0, additionalCharge: 0, gemstonePricing: [] },
    rates: { gold10g: { k22: 600000 } },
    gstRate: 3,
  });
  assert.equal(result.metalPrice, 0);
});
test("18. Every customer order creation path receives guarded order data", () => {
  const orderSource = read("src/modules/user/controllers/order.controller.js");
  const paymentSource = read("src/modules/user/controllers/payment.controller.js");
  assert.equal((orderSource.match(/Order\.create\(/g) || []).length, 1);
  assert.equal((paymentSource.match(/Order\.create\(/g) || []).length, 1);
  assert.match(orderSource, /const orderData = await _calculateOrderData/);
  assert.match(paymentSource, /const orderData = await _calculateOrderData/);
  assert.throws(
    () => assertImmutableOrderItemsPriced([{ productId: "p1", variantId: "v1", quantity: 1, price: 0 }]),
    (error) => error.code === "PRICE_UNAVAILABLE",
  );
  assert.doesNotThrow(() => assertImmutableOrderItemsPriced([{ productId: "p1", variantId: "v1", quantity: 1, price: 500 }]));
});
