const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: "text" },
  slug: { type: String, unique: true, index: true },
  productCode: { type: String, unique: true, sparse: true },
  sku: { type: String, unique: true, sparse: true },
  huid: { type: String, trim: true, sparse: true },
  brand: { type: String, default: "ALANKA JEWELLERS" },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  category: { type: String },
  categorySlug: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: { type: String },
  stylingTips: { type: String },
  material: { type: String, default: 'Silver' },
  goldTone: {
    type: String,
    enum: ['Yellow Gold', 'Rose Gold', 'White Gold', ''],
    default: ''
  },
  gemstoneType: { type: String, trim: true, default: '' },
  gemstones: [{ type: String, trim: true }],
  imageIntegrityConfirmed: { type: Boolean, default: false },
  sourceDocumentationConfirmed: { type: Boolean, default: false },
  audience: [{
    type: String,
    enum: ["men", "women", "family", "unisex"],
    default: "unisex"
  }],
  silverCategory: {
    type: String,
    enum: ['800', '835', '925', '925 sterling silver', '958', '970', '990', '999', '']
  },
  goldCategory: {
    type: String,
    enum: ['14', '18', '22', '24', '']
  },
  careTips: { type: String, default: '' },
  settingMetal: {
    type: String,
    enum: ["Gold", "White Gold", "Rose Gold", "Platinum", "Silver", ""],
    default: ""
  },
  settingPurity: { type: String, default: "" },
  weight: { type: Number },
  weightUnit: { type: String, enum: ["Grams", "Milligrams"], default: "Grams" },
  specifications: { type: String },
  supplierInfo: { type: String },
  cardLabel: { type: String },
  cardBadge: { type: String },
  images: [{ type: String }],
  // Diamond origin can be specified at product-level (default) and overridden per variant.
  // Values: none | lab_grown | natural
  diamondType: {
    type: String,
    enum: ["none", "lab_grown", "natural"],
    default: "none"
  },
  // Optional product-specific video used on Product Details. Admin/Seller can upload it.
  videoUrl: { type: String, default: "" },
  paymentGatewayChargeBearer: {
    type: String,
    enum: ["store", "seller", "user"],
    default: "store"
  },
  variants: [{
    name: { type: String, required: true },
    size: { type: String, trim: true },
    variantCode: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    weightUnit: { type: String, enum: ["Grams", "Milligrams"], default: "Grams" },
    variantImages: [{ type: String }],
    variantFaqs: [{
      question: { type: String, trim: true },
      answer: { type: String, trim: true }
    }],
    makingCharge: { type: Number, default: 0 },
    // ── Legacy diamond/stone price (authoritative computed value) ─────────
    // This is the single diamond/stone amount fed into subtotalBeforeTax.
    // Populated either from diamondPricing (new) or direct admin entry (legacy).
    // Do NOT set this directly when using the new diamondPricing sub-object.
    diamondPrice: { type: Number, default: 0 },
    diamondType: {
      type: String,
      enum: ["none", "lab_grown", "natural"],
      default: "none"
    },
    hallmarkingCharge: { type: Number, default: 0 },
    // Legacy certificate charge (included in hiddenCharge).
    // If diamondPricing.enabled, this is auto-synced from diamondPricing.certificateCharge.
    diamondCertificateCharge: { type: Number, default: 0 },
    additionalCharge: { type: Number, default: 0 },
    hiddenCharge: { type: Number, default: 0 },
    subtotalBeforeTax: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    priceAfterTax: { type: Number, default: 0 },
    pgChargePercent: { type: Number, default: 0 },
    pgChargeAmount: { type: Number, default: 0 },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    metalPrice: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 0 },
    discount: { type: Number },
    stock: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0 },
    // ── Diamond descriptive specs (informational — do NOT auto-generate price) ──
    diamondSpecs: {
      carat: { type: String, default: "" },
      clarity: { type: String, default: "" },
      color: { type: String, default: "" },
      cut: { type: String, default: "" },
      shape: { type: String, default: "" },
      diamondCount: { type: Number, default: 0 }
    },
    // ── Diamond Pricing (Admin-Controlled) ───────────────────────────────
    // When enabled=true, this object is the authoritative source for diamondPrice.
    // The legacy diamondPrice field is overwritten by the value resolved here.
    // API Mitra gold/silver rates NEVER touch these fields.
    diamondPricing: {
      enabled: { type: Boolean, default: false },
      // "total": admin enters the full diamond price directly.
      // "per_carat": finalDiamondPrice = carat × pricePerCarat.
      pricingMode: {
        type: String,
        enum: ["total", "per_carat"],
        default: "total"
      },
      // Used only when pricingMode = "per_carat".
      // carat is read from diamondSpecs.carat (existing field) so we don't duplicate.
      pricePerCarat: { type: Number, default: 0, min: 0 },
      // Used when pricingMode = "total".
      totalPrice: { type: Number, default: 0, min: 0 },
      // Certificate charge for the diamond grading report (GIA / IGI etc.).
      // This syncs into the legacy diamondCertificateCharge field automatically.
      certificateCharge: { type: Number, default: 0, min: 0 },
      // Optional URL to diamond grading certificate document.
      certificateUrl: { type: String, default: "" }
    },
    // ── Gemstone Pricing (Admin-Controlled, supports multiple stones) ────
    // API Mitra rates NEVER touch gemstonePricing.
    // gemstonePrice is the computed sum of all stones and is written to
    // subtotalBeforeTax alongside diamondPrice. Both can be present only when
    // the admin explicitly configures both structured pricing sources.
    gemstonePricing: [{
      gemstoneType: {
        type: String,
        enum: ["Ruby", "Emerald", "Sapphire", "Pearl", "Other"],
        required: true
      },
      // Informational — used for per_carat pricing mode.
      weight: { type: Number, default: 0, min: 0 },
      quantity: { type: Number, default: 1, min: 0 },
      pricingMode: {
        type: String,
        enum: ["total", "per_carat"],
        default: "total"
      },
      // Used when pricingMode = "per_carat": price = weight × pricePerCarat.
      pricePerCarat: { type: Number, default: 0, min: 0 },
      // Used when pricingMode = "total".
      totalPrice: { type: Number, default: 0, min: 0 },
      // Optional certificate charge for this specific stone.
      certificateCharge: { type: Number, default: 0, min: 0 },
      _id: false
    }],
    // Computed sum of all gemstonePricing entries. Set by metalPricing utility.
    // DO NOT set manually — it is overwritten on every product save.
    gemstonePrice: { type: Number, default: 0 },
    gemstoneCertificateCharge: { type: Number, default: 0 },
    serialCodes: [{
      code: { type: String, trim: true },
      status: { type: String, enum: ["AVAILABLE", "SOLD_OFFLINE", "SOLD_ONLINE"], default: "AVAILABLE" }
    }]
  }],
  tags: {
    isNewArrival: { type: Boolean, default: false },
    isMostGifted: { type: Boolean, default: false },
    isNewLaunch: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false }
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  status: { type: String, enum: ["Active", "Draft", "Archived"], default: "Active" },
  showInNavbar: { type: Boolean, default: true },
  showInCollection: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
  navShopByCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  // New Marketing & Logistics Fields
  seo: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: { type: String, trim: true }
  },
  logistics: {
    estimatedShippingDays: { type: Number, default: 3 },
    certificateUrl: { type: String, default: "" }
  },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  faqs: [{
    question: { type: String, trim: true },
    answer: { type: String, trim: true }
  }],
  isSerialized: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
