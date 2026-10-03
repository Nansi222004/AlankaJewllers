const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  computeVariantPricing,
  applyMetalPricingToProduct,
  resolveDiamondPrice,
  resolveGemstonePrice
} = require('../src/utils/metalPricing');
const { validateProductPricing } = require('../src/modules/admin/controllers/product.controller');

const rates = {
  gold10g: { k14: 420000, k18: 500000, k22: 600000, k24: 650000 },
  silver10g: { sterling925: 800, silverOther: 900 },
  platinum10g: { pt950: 300000 }
};

const baseVariant = (overrides = {}) => ({
  name: 'Standard',
  weight: 1,
  weightUnit: 'Grams',
  makingCharge: 100,
  hallmarkingCharge: 10,
  diamondCertificateCharge: 0,
  additionalCharge: 20,
  diamondPrice: 0,
  diamondType: 'none',
  diamondSpecs: { carat: '', diamondCount: 0 },
  gemstonePricing: [],
  ...overrides
});

const price = (product, variant, gstRate = 0) => computeVariantPricing({ product, variant, rates, gstRate });

test('1. Gold-only pricing uses the configured gold rate', () => {
  const result = price({ material: 'Gold', goldCategory: '22' }, baseVariant());
  assert.equal(result.metalPrice, 60000);
  assert.equal(result.finalPrice, 60130);
});

test('2. Silver-only pricing uses the configured silver rate', () => {
  const result = price({ material: 'Silver', silverCategory: '925 sterling silver' }, baseVariant());
  assert.equal(result.metalPrice, 80);
  assert.equal(result.finalPrice, 210);
});

test('3. Gold + Natural Diamond adds the admin total once', () => {
  const result = price({ material: 'Gold', goldCategory: '22' }, baseVariant({
    diamondType: 'natural', diamondPricing: { enabled: true, pricingMode: 'total', totalPrice: 30000, certificateCharge: 500 }
  }));
  assert.equal(result.diamondPrice, 30000);
  assert.equal(result.finalPrice, 90630);
});

test('4. Gold + Lab-Grown Diamond supports per-carat pricing', () => {
  const result = price({ material: 'Gold', goldCategory: '22' }, baseVariant({
    diamondType: 'lab_grown', diamondSpecs: { carat: '0.5' },
    diamondPricing: { enabled: true, pricingMode: 'per_carat', pricePerCarat: 40000, certificateCharge: 0 }
  }));
  assert.equal(result.diamondPrice, 20000);
});

test('5. Silver + Diamond keeps silver metal and diamond components separate', () => {
  const result = price({ material: 'Silver', silverCategory: '925 sterling silver' }, baseVariant({
    diamondType: 'natural', diamondPricing: { enabled: true, pricingMode: 'total', totalPrice: 10000 }
  }));
  assert.equal(result.metalPrice, 80);
  assert.equal(result.diamondPrice, 10000);
});

for (const [number, gemstoneType] of [[6, 'Ruby'], [7, 'Emerald'], [8, 'Sapphire']]) {
  test(`${number}. Gold + ${gemstoneType} uses only the admin-entered gemstone total`, () => {
    const result = price({ material: 'Gold', goldCategory: '22' }, baseVariant({
      gemstonePricing: [{ gemstoneType, quantity: 1, weight: 1, pricingMode: 'total', totalPrice: 5000 }]
    }));
    assert.equal(result.gemstonePrice, 5000);
    assert.equal(result.diamondPrice, 0);
  });
}

test('9. Multiple gemstones are summed once', () => {
  const result = resolveGemstonePrice({ gemstonePricing: [
    { pricingMode: 'total', totalPrice: 3000, certificateCharge: 100 },
    { pricingMode: 'per_carat', weight: 2, pricePerCarat: 2500, certificateCharge: 200 }
  ] });
  assert.deepEqual(result, { resolvedGemstonePrice: 8000, resolvedGemstoneCertCharge: 300 });
});

test('10. Diamond total mode uses totalPrice', () => {
  assert.equal(resolveDiamondPrice({ diamondPricing: { enabled: true, pricingMode: 'total', totalPrice: 12345 } }).resolvedDiamondPrice, 12345);
});

test('11. Diamond per-carat mode multiplies carat by pricePerCarat', () => {
  assert.equal(resolveDiamondPrice({ diamondSpecs: { carat: '1.25' }, diamondPricing: { enabled: true, pricingMode: 'per_carat', pricePerCarat: 20000 } }).resolvedDiamondPrice, 25000);
});

test('12. Gemstone total mode uses totalPrice', () => {
  assert.equal(resolveGemstonePrice({ gemstonePricing: [{ pricingMode: 'total', totalPrice: 7000 }] }).resolvedGemstonePrice, 7000);
});

test('13. Gemstone per-carat mode multiplies weight by pricePerCarat', () => {
  assert.equal(resolveGemstonePrice({ gemstonePricing: [{ pricingMode: 'per_carat', weight: 1.5, pricePerCarat: 6000 }] }).resolvedGemstonePrice, 9000);
});

test('14. Missing required Diamond pricing is rejected', () => {
  const error = validateProductPricing({
    material: 'Diamond', diamondType: 'natural', settingMetal: 'Gold', settingPurity: '22K',
    variants: [baseVariant({ diamondType: 'natural' })]
  });
  assert.match(error, /Diamond pricing is required/);
});

test('15. Negative pricing is rejected', () => {
  const error = validateProductPricing({ material: 'Gold', variants: [baseVariant({ additionalCharge: -1 })] });
  assert.match(error, /cannot be negative/);
});

test('16. Per-carat diamond pricing rejects zero carat', () => {
  const error = validateProductPricing({ material: 'Gold', variants: [baseVariant({
    diamondType: 'natural', diamondSpecs: { carat: 0 }, diamondPricing: { enabled: true, pricingMode: 'per_carat', pricePerCarat: 10000 }
  })] });
  assert.match(error, /carat and price per carat greater than zero/);
});

test('17. Structured gemstone pricing replaces the legacy shared stone amount', () => {
  const result = price({ material: 'Gems', settingMetal: 'Gold', settingPurity: '22K' }, baseVariant({
    diamondPrice: 99999,
    gemstonePricing: [{ gemstoneType: 'Ruby', quantity: 1, pricingMode: 'total', totalPrice: 5000 }]
  }));
  assert.equal(result.diamondPrice, 0);
  assert.equal(result.gemstonePrice, 5000);

  const legacyProduct = applyMetalPricingToProduct({
    material: 'Gems', settingMetal: 'Gold', settingPurity: '22K',
    variants: [baseVariant({ diamondPrice: 7000, diamondCertificateCharge: 100 })]
  }, rates, 0);
  assert.equal(legacyProduct.variants[0].diamondPrice, 7000);
  assert.equal(legacyProduct.variants[0].gemstonePrice, 7000);
  assert.equal(legacyProduct.variants[0].finalPrice, 67230);
});

test('18. GST is applied to the taxable subtotal', () => {
  const result = price({ material: 'Silver', silverCategory: '925 sterling silver' }, baseVariant(), 3);
  assert.equal(result.subtotalBeforeTax, 210);
  assert.equal(result.gstAmount, 6.3);
  assert.equal(result.priceAfterTax, 216.3);
});

test('19. Customer-borne PG charge is applied after GST', () => {
  const result = price({ material: 'Silver', silverCategory: '925 sterling silver', paymentGatewayChargeBearer: 'user' }, baseVariant(), 3);
  assert.equal(result.pgChargePercent, 2);
  assert.equal(result.pgChargeAmount, 4.33);
  assert.equal(result.finalPrice, 220.63);
});

test('20. Checkout snapshots the server variant price and Razorpay uses order total', () => {
  const orderController = fs.readFileSync(path.join(__dirname, '../src/modules/user/controllers/order.controller.js'), 'utf8');
  const paymentController = fs.readFileSync(path.join(__dirname, '../src/modules/user/controllers/payment.controller.js'), 'utf8');
  assert.match(orderController, /const itemTotal = purchasable\.price \* purchasable\.quantity/);
  assert.match(orderController, /price: purchasable\.price/);
  assert.match(paymentController, /amount: Math\.round\(order\.total \* 100\)/);
});
