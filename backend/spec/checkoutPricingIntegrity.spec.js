const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { calculateShippingQuote } = require("../src/utils/shippingQuote");
const { computeVariantPricing } = require("../src/utils/metalPricing");
const { buildOrderItemPricingSnapshot } = require("../src/utils/orderPricingSnapshot");
const PaymentQuote = require("../src/models/PaymentQuote");

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

const rates = {
  gold10g: { k14: 420000, k18: 500000, k22: 600000, k24: 650000 },
  silver10g: { sterling925: 800, silverOther: 900 },
};
const variant = (extra = {}) => ({
  weight: 1,
  weightUnit: "Grams",
  makingCharge: 100,
  hallmarkingCharge: 10,
  additionalCharge: 20,
  diamondPrice: 0,
  diamondCertificateCharge: 0,
  gemstonePricing: [],
  diamondSpecs: { carat: "" },
  ...extra,
});
const price = (product, item) =>
  computeVariantPricing({ product, variant: item, rates, gstRate: 3 });

test("A1. Admin configured shipping is used", () => {
  assert.equal(calculateShippingQuote({ subtotal: 500, settings: { shippingCharges: 75, freeShippingThreshold: 1000 } }).shipping, 75);
});
test("A2. Configured free-shipping threshold uses the existing strict-above rule", () => {
  assert.equal(calculateShippingQuote({ subtotal: 1000, settings: { shippingCharges: 75, freeShippingThreshold: 1000 } }).shipping, 75);
  assert.equal(calculateShippingQuote({ subtotal: 1000.01, settings: { shippingCharges: 75, freeShippingThreshold: 1000 } }).shipping, 0);
});
test("A3. Free-shipping coupon overrides configured shipping", () => {
  assert.equal(calculateShippingQuote({ subtotal: 100, isFreeShipping: true, settings: { shippingCharges: 75, freeShippingThreshold: 1000 } }).shipping, 0);
});
test("A4. Coupon discount participates in the shipping threshold", () => {
  const quote = calculateShippingQuote({ subtotal: 1000, discount: 200, settings: { shippingCharges: 75, freeShippingThreshold: 900 } });
  assert.equal(quote.thresholdAmount, 800);
  assert.equal(quote.shipping, 75);
});
test("A5. Gift wrap participates in the shipping threshold", () => {
  const quote = calculateShippingQuote({ subtotal: 850, giftWrapCharge: 100, settings: { shippingCharges: 75, freeShippingThreshold: 900 } });
  assert.equal(quote.thresholdAmount, 950);
  assert.equal(quote.shipping, 0);
});

test("B6. Gold pricing remains unchanged", () => assert.equal(price({ material: "Gold", goldCategory: "22" }, variant()).finalPrice, 61933.9));
test("B7. Silver pricing remains unchanged", () => assert.equal(price({ material: "Silver", silverCategory: "925 sterling silver" }, variant()).finalPrice, 216.3));
test("B8. Natural Diamond pricing remains authoritative", () => {
  const result = price({ material: "Gold", goldCategory: "22" }, variant({ diamondPricing: { enabled: true, pricingMode: "total", totalPrice: 30000, certificateCharge: 500 } }));
  assert.equal(result.diamondPrice, 30000);
  assert.equal(result.finalPrice, 93348.9);
});
test("B9. Lab Diamond per-carat pricing remains authoritative", () => {
  const result = price({ material: "Gold", goldCategory: "22" }, variant({ diamondSpecs: { carat: "0.5" }, diamondPricing: { enabled: true, pricingMode: "per_carat", pricePerCarat: 40000 } }));
  assert.equal(result.diamondPrice, 20000);
});
for (const [number, gemstoneType] of [[10, "Ruby"], [11, "Emerald"], [12, "Sapphire"]]) {
  test(`B${number}. Gold + ${gemstoneType} remains single-counted`, () => {
    const result = price({ material: "Gold", goldCategory: "22" }, variant({ diamondPrice: 99999, gemstonePricing: [{ gemstoneType, pricingMode: "total", totalPrice: 5000 }] }));
    assert.equal(result.diamondPrice, 0);
    assert.equal(result.gemstonePrice, 5000);
  });
}

test("C13. Stale cart prices produce PRICE_UPDATED details", () => {
  const source = read("src/modules/user/controllers/order.controller.js");
  assert.match(source, /oldPrice: roundCurrency\(submittedPrice\)/);
  assert.match(source, /newPrice: roundCurrency\(serverPrice\)/);
  assert.match(source, /quoteCode: priceChanges\.length > 0 \? "PRICE_UPDATED"/);
});
test("C14. Server checkout quote loads Product variants and ignores client totals", () => {
  const source = read("src/modules/user/controllers/order.controller.js");
  assert.match(source, /const product = await Product\.findById\(item\.productId\)/);
  assert.match(source, /const itemTotal = variant\.price \* item\.quantity/);
  assert.match(source, /exports\.getCheckoutQuote/);
});
test("C15. Payment quote stores immutable amount, currency, snapshot and expiry", () => {
  const paths = PaymentQuote.schema.paths;
  for (const field of ["orderData", "amountPaise", "currency", "razorpayOrderId", "status", "expiresAt"]) assert.ok(paths[field]);
});
test("C16. Razorpay verification checks exact amount, currency and order id", () => {
  const source = read("src/modules/user/controllers/payment.controller.js");
  assert.match(source, /Number\(gatewayPayment\.amount\) !== Number\(paymentQuote\.amountPaise\)/);
  assert.match(source, /gatewayPayment\.order_id !== paymentQuote\.razorpayOrderId/);
  assert.match(source, /toUpperCase\(\) !== paymentQuote\.currency/);
});
test("C17. Repeated verification is idempotent and quote consumption is atomic", () => {
  const source = read("src/modules/user/controllers/payment.controller.js");
  assert.match(source, /paymentQuote\.status = "consumed"/);
  assert.match(source, /status: "pending"[\s\S]*\$set: \{ status: "processing" \}/);
  assert.match(source, /Payment already verified/);
});
test("C18. Verification uses the immutable quote without recalculating current products", () => {
  const verifySource = read("src/modules/user/controllers/payment.controller.js").split("exports.verifyPayment =")[1];
  assert.doesNotMatch(verifySource, /_calculateOrderData\(/);
  assert.match(verifySource, /paymentQuote\.orderData/);
});

test("D19. GST rate and amount are preserved in the item snapshot", () => {
  const calculated = price({ material: "Silver", silverCategory: "925 sterling silver" }, variant());
  const snapshot = buildOrderItemPricingSnapshot({ material: "Silver", silverCategory: "925 sterling silver" }, calculated);
  assert.equal(snapshot.gstRate, 3);
  assert.equal(snapshot.gstAmount, 6.3);
});
test("D20. Invoice uses the stored order.shipping field", () => {
  const source = read("src/modules/admin/controllers/invoice.controller.js");
  assert.match(source, /Number\(order\.shipping \|\| 0\)/);
  assert.doesNotMatch(source, /order\.shippingFee/);
});
test("D21. Diamond and Gemstone values are independently snapshotted", () => {
  const snapshot = buildOrderItemPricingSnapshot({ material: "Gold", goldCategory: "22" }, { ...variant(), diamondPrice: 12000, gemstonePrice: 5000, subtotalBeforeTax: 17130, gstAmount: 513.9, price: 17643.9 });
  assert.equal(snapshot.diamondPrice, 12000);
  assert.equal(snapshot.gemstonePrice, 5000);
});
test("D22. Historical invoice fallback does not use current GST settings", () => {
  const source = read("src/modules/admin/controllers/invoice.controller.js");
  assert.doesNotMatch(source, /settings\?\.gstRate/);
  assert.match(source, /const gstRate = hasSnapshot[\s\S]*: 0/);
});
test("D23. Invoice generation does not read current metal rates or recalculate products", () => {
  const source = read("src/modules/admin/controllers/invoice.controller.js");
  assert.doesNotMatch(source, /metalRates|computeVariantPricing|applyMetalPricingToProduct/);
  assert.match(source, /item\.pricingSnapshot/);
});
