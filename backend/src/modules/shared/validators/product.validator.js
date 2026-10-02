const Joi = require("joi");

const boolField = Joi.boolean().truthy("true").falsy("false");

const variantSchema = Joi.object({
  _id: Joi.string().trim().allow(""),
  name: Joi.string().required().trim(),
  size: Joi.string().trim().allow("").optional(),
  variantCode: Joi.string().trim().allow(""),
  mrp: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().required().min(0),
  sold: Joi.number().integer().min(0).optional(),
  discount: Joi.number().min(0).max(100),
  weight: Joi.number().min(0).optional(),
  weightUnit: Joi.string().valid("Grams", "Milligrams").optional(),
  metalPrice: Joi.number().min(0).optional(),
  makingCharge: Joi.number().min(0).optional(),
  diamondPrice: Joi.number().min(0).optional(),
  diamondType: Joi.string().valid("none", "lab_grown", "natural").optional(),
  hallmarkingCharge: Joi.number().min(0).optional(),
  diamondCertificateCharge: Joi.number().min(0).optional(),
  additionalCharge: Joi.number().min(0).optional(),
  hiddenCharge: Joi.number().min(0).optional(),
  subtotalBeforeTax: Joi.number().min(0).optional(),
  gstAmount: Joi.number().min(0).optional(),
  priceAfterTax: Joi.number().min(0).optional(),
  pgChargePercent: Joi.number().min(0).optional(),
  pgChargeAmount: Joi.number().min(0).optional(),
  gst: Joi.number().min(0).optional(),
  finalPrice: Joi.number().min(0).optional(),
  variantImages: Joi.array().items(Joi.string().trim()).optional(),
  variantFaqs: Joi.array().items(Joi.object({
    _id: Joi.string().trim().allow(""),
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required()
  })).optional(),
  diamondSpecs: Joi.object({
    carat: Joi.string().trim().allow(""),
    clarity: Joi.string().trim().allow(""),
    color: Joi.string().trim().allow(""),
    cut: Joi.string().trim().allow(""),
    shape: Joi.string().trim().allow(""),
    diamondCount: Joi.number().integer().min(0).optional()
  }).optional(),
  serialCodes: Joi.array().items(Joi.object({
    _id: Joi.string().trim().allow(""),
    code: Joi.string().trim().required(),
    status: Joi.string().valid("AVAILABLE", "SOLD_OFFLINE", "SOLD_ONLINE").optional()
  })).optional()
});

const productSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100),
  productCode: Joi.string().trim().allow(""),
  slug: Joi.string().trim().lowercase(),
  brand: Joi.string().default("Alankar Jewellers"),
  categories: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).max(1).required(),
  description: Joi.string().required(),
  stylingTips: Joi.string().allow(""),
  careTips: Joi.string().allow(""),
  material: Joi.string().required(),
  goldTone: Joi.when("material", {
    is: "Gold",
    then: Joi.string().valid("Yellow Gold", "Rose Gold", "White Gold").required(),
    otherwise: Joi.string().valid("Yellow Gold", "Rose Gold", "White Gold", "").allow("").optional()
  }),
  gemstoneType: Joi.when("material", {
    is: "Gems",
    then: Joi.string().trim().min(2).required(),
    otherwise: Joi.string().trim().allow("").optional()
  }),
  gemstones: Joi.when("material", {
    is: "Gems",
    then: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
    otherwise: Joi.array().items(Joi.string().trim().min(1)).optional()
  }),
  imageIntegrityConfirmed: boolField.optional(),
  sourceDocumentationConfirmed: boolField.optional(),
  audience: Joi.array()
    .items(Joi.string().valid("men", "women", "family", "unisex"))
    .min(1)
    .default(["unisex"]),
  silverCategory: Joi.when("material", {
    is: "Silver",
    then: Joi.string().valid("800", "835", "925", "925 sterling silver", "958", "970", "990", "999").required(),
    otherwise: Joi.string().allow("").optional()
  }),
  goldCategory: Joi.when("material", {
    is: "Gold",
    then: Joi.string().valid("14", "18", "22", "24").required(),
    otherwise: Joi.string().allow("").optional()
  }),
  settingMetal: Joi.when("material", {
    is: "Diamond",
    then: Joi.string().valid("Gold", "White Gold", "Rose Gold", "Platinum", "Silver").required(),
    otherwise: Joi.string().valid("Gold", "White Gold", "Rose Gold", "Platinum", "Silver", "").allow("").optional()
  }),
  settingPurity: Joi.when("material", {
    is: "Diamond",
    then: Joi.string().valid("14K", "18K", "22K", "Platinum 950", "925 sterling silver").required(),
    otherwise: Joi.string().allow("").optional()
  }),
  diamondType: Joi.when("material", {
    is: "Diamond",
    then: Joi.string().valid("lab_grown", "natural").required(),
    otherwise: Joi.string().valid("none", "lab_grown", "natural").optional()
  }),
  weight: Joi.number().min(0),
  weightUnit: Joi.string().valid("Grams", "Milligrams").default("Grams"),
  specifications: Joi.string().allow(""),
  supplierInfo: Joi.string().allow(""),
  cardLabel: Joi.string().allow(""),
  cardBadge: Joi.string().allow(""),
  videoUrl: Joi.string().trim().allow(""),
  removeVideo: boolField.optional(),
  paymentGatewayChargeBearer: Joi.string().valid("store", "seller", "user").default("store"),
  huid: Joi.string().allow(""),
  sizes: Joi.array().items(Joi.string().trim()).optional(),
  variants: Joi.array().items(variantSchema).min(1).required(),
  tags: Joi.object({
    isNewArrival: boolField,
    isMostGifted: boolField,
    isNewLaunch: boolField,
    isTrending: boolField,
    isPremium: boolField
  }),
  status: Joi.string().valid("Active", "Draft", "Archived").default("Active"),
  showInNavbar: boolField,
  showInCollection: boolField,
  active: boolField,
  isSerialized: boolField.optional(),
  images: Joi.any(),
  deletedImages: Joi.array().items(Joi.string()).allow(null),
  faqs: Joi.array().items(Joi.object({
    _id: Joi.string().trim().allow(""),
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required()
  })),
  seo: Joi.object({
    title: Joi.string().trim().allow(""),
    description: Joi.string().trim().allow(""),
    keywords: Joi.string().trim().allow("")
  }).optional(),
  logistics: Joi.object({
    estimatedShippingDays: Joi.number().integer().min(0).optional(),
    certificateUrl: Joi.string().trim().allow("")
  }).optional(),
  relatedProducts: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
}).custom((value, helpers) => {
  const catalogueMaterial = ["Gold", "Silver", "Diamond", "Gems"].includes(value.material);
  const isPublishing = value.status === "Active" && value.active !== false;

  if (catalogueMaterial && isPublishing && value.imageIntegrityConfirmed !== true) {
    return helpers.message({ custom: "Confirm that the images show this exact product before publishing." });
  }
  if (value.material === "Diamond") {
    const compatiblePurities = {
      Gold: ["14K", "18K", "22K"],
      "White Gold": ["14K", "18K", "22K"],
      "Rose Gold": ["14K", "18K", "22K"],
      Platinum: ["Platinum 950"],
      Silver: ["925 sterling silver"]
    };
    if (!compatiblePurities[value.settingMetal]?.includes(value.settingPurity)) {
      return helpers.message({ custom: "Setting purity is not compatible with the selected setting metal." });
    }
    if (isPublishing && value.sourceDocumentationConfirmed !== true) {
      return helpers.message({ custom: "Source documentation confirmation is required for Diamond products." });
    }
  }
  if (value.material === "Gems" && ["Ruby", "Emerald", "Sapphire"].includes(value.gemstoneType) && value.sourceDocumentationConfirmed !== true) {
    return helpers.message({ custom: "Source documentation confirmation is required for this gemstone claim." });
  }
  return value;
});

module.exports = { productSchema };
