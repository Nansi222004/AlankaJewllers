/**
 * Metal Rate Resolution with Priority Fallback
 * 
 * Priority:
 * 1. API Mitra live rate (primary)
 * 2. Cached API Mitra rate (if live unavailable)
 * 3. Admin fallback rate (emergency)
 * 4. UNAVAILABLE (blocks checkout)
 * 
 * CRITICAL: A valid API Mitra rate ALWAYS takes priority over admin rate.
 * Admin rate is ONLY used when API Mitra is completely unavailable.
 */

const { metalRateService } = require("../services/metalRate.service");

const normalizeString = (value = "") => String(value || "").trim().toLowerCase();

/**
 * Validate that a rate value is usable
 */
const isValidRate = (rate) => {
  const num = Number(rate);
  return Number.isFinite(num) && num > 0;
};

/**
 * Map purity/category to API Mitra response keys
 */
const mapPurityToApiKey = (purity) => {
  const normalized = normalizeString(purity);
  if (normalized.includes("24")) return "24K";
  if (normalized.includes("22")) return "22K";
  if (normalized.includes("18")) return "18K";
  if (normalized.includes("14")) return "14K";
  return null;
};

/**
 * Resolve Gold rate with fallback priority
 * 
 * @param {string} purity - Gold purity (14K, 18K, 22K, 24K)
 * @param {object} adminFallback - Admin configured fallback rates
 * @param {string} city - City for API Mitra lookup
 * @returns {Promise<{rate: number, source: string, isLive: boolean}>}
 */
const resolveGoldRate = async (purity, adminFallback = {}, city = null) => {
  const apiKey = mapPurityToApiKey(purity);
  
  // Priority 1 & 2: Try API Mitra (live or cached)
  if (apiKey && metalRateService.isEnabled()) {
    try {
      const apiRates = await metalRateService.getRates(city);
      
      if (apiRates?.success && apiRates.gold?.[apiKey]) {
        const apiRate = apiRates.gold[apiKey];
        
        // Convert per_gram or per_gram_24k to per 10g
        let ratePer10g = null;
        if (apiRate.unit === "per_gram" || apiRate.unit === "per_gram_24k") {
          ratePer10g = Number(apiRate.rate) * 10;
        } else if (apiRate.unit === "per_10g") {
          ratePer10g = Number(apiRate.rate);
        }
        
        if (isValidRate(ratePer10g)) {
          return {
            rate: ratePer10g,
            source: apiRates.isLive ? "APIMITRA" : "APIMITRA_CACHE",
            isLive: apiRates.isLive === true,
            city: apiRates.city,
            updatedAt: apiRates.updatedAt
          };
        }
      }
    } catch (error) {
      // API Mitra failed, continue to fallback
      console.warn(`[MetalRateResolver] API Mitra failed for Gold ${purity}:`, error.message);
    }
  }
  
  // Priority 3: Admin fallback rate
  const adminRate = adminFallback.gold10g?.[`k${purity.replace(/K/i, "")}`];
  if (isValidRate(adminRate)) {
    return {
      rate: Number(adminRate),
      source: "ADMIN_FALLBACK",
      isLive: false
    };
  }
  
  // Priority 4: Unavailable
  return {
    rate: null,
    source: "UNAVAILABLE",
    isLive: false
  };
};

/**
 * Resolve Silver rate with fallback priority
 * 
 * @param {string} category - Silver category (sterling925, silverOther)
 * @param {object} adminFallback - Admin configured fallback rates
 * @param {string} city - City for API Mitra lookup
 * @returns {Promise<{rate: number, source: string, isLive: boolean}>}
 */
const resolveSilverRate = async (category, adminFallback = {}, city = null) => {
  // Priority 1 & 2: Try API Mitra (live or cached)
  if (metalRateService.isEnabled()) {
    try {
      const apiRates = await metalRateService.getRates(city);
      
      if (apiRates?.success && apiRates.silver) {
        const apiRate = apiRates.silver;
        
        // API Mitra returns silver per 10g
        let ratePer10g = null;
        if (apiRate.unit === "per_10g") {
          ratePer10g = Number(apiRate.rate);
        } else if (apiRate.unit === "per_gram") {
          ratePer10g = Number(apiRate.rate) * 10;
        }
        
        if (isValidRate(ratePer10g)) {
          return {
            rate: ratePer10g,
            source: apiRates.isLive ? "APIMITRA" : "APIMITRA_CACHE",
            isLive: apiRates.isLive === true,
            city: apiRates.city,
            updatedAt: apiRates.updatedAt
          };
        }
      }
    } catch (error) {
      // API Mitra failed, continue to fallback
      console.warn(`[MetalRateResolver] API Mitra failed for Silver ${category}:`, error.message);
    }
  }
  
  // Priority 3: Admin fallback rate
  const adminRate = adminFallback.silver10g?.[category];
  if (isValidRate(adminRate)) {
    return {
      rate: Number(adminRate),
      source: "ADMIN_FALLBACK",
      isLive: false
    };
  }
  
  // Priority 4: Unavailable
  return {
    rate: null,
    source: "UNAVAILABLE",
    isLive: false
  };
};

/**
 * Resolve metal rate for a product/variant with proper fallback
 * 
 * @param {object} product - Product data
 * @param {object} adminFallback - Admin fallback rates from Setting.metalRates
 * @param {string} city - Optional city for API Mitra
 * @returns {Promise<object>} Resolved rates with sources
 */
const resolveMetalRates = async (product, adminFallback = {}, city = null) => {
  const material = normalizeString(product.material);
  const settingMetal = normalizeString(product.settingMetal);
  const isStoneSetProduct = material === "diamond" || material === "gems";
  
  const resolved = {
    gold10g: {},
    silver10g: {},
    platinum10g: adminFallback.platinum10g || {},
    goldPerGram: 0,
    silverPerGram: 0,
    platinumPerGram: adminFallback.platinumPerGram || 0,
    sources: {}
  };
  
  // Resolve Gold rates if needed
  if (material === "gold" || (isStoneSetProduct && ["gold", "white gold", "rose gold"].includes(settingMetal))) {
    const goldCategory = product.goldCategory || product.settingPurity;
    
    // Resolve all gold purities to support admin UI display
    for (const [key, purity] of [["k14", "14K"], ["k18", "18K"], ["k22", "22K"], ["k24", "24K"]]) {
      const result = await resolveGoldRate(purity, adminFallback, city);
      
      // Track if this is the active purity for the product
      const isActivePurity = purity === goldCategory || purity.replace("K", "") === goldCategory;
      
      if (isActivePurity && result.source === "UNAVAILABLE") {
        throw new Error(`Metal rate unavailable for Gold ${goldCategory}. Cannot price product.`);
      }
      
      resolved.gold10g[key] = result.rate || 0;
      resolved.sources[`gold_${key}`] = result.source;
      
      if (isActivePurity) {
        resolved.sources.activeGold = result.source;
        resolved.sources.activeGoldIsLive = result.isLive;
      }
    }
    
    // Set goldPerGram from primary purity
    const primaryPurity = mapPurityToApiKey(goldCategory);
    if (primaryPurity && resolved.gold10g[`k${primaryPurity.replace("K", "")}`]) {
      resolved.goldPerGram = resolved.gold10g[`k${primaryPurity.replace("K", "")}`] / 10;
    }
  }
  
  // Resolve Silver rates if needed
  if (material === "silver" || (isStoneSetProduct && settingMetal === "silver")) {
    const silverCategory = normalizeString(product.silverCategory || product.settingPurity);
    const isSterling = silverCategory.includes("sterling") || silverCategory.includes("925");
    const category = isSterling ? "sterling925" : "silverOther";
    
    const result = await resolveSilverRate(category, adminFallback, city);
    
    if (result.source === "UNAVAILABLE") {
      throw new Error(`Metal rate unavailable for Silver ${silverCategory}. Cannot price product.`);
    }
    
    resolved.silver10g[category] = result.rate || 0;
    resolved.silverPerGram = (result.rate || 0) / 10;
    resolved.sources.activeSilver = result.source;
    resolved.sources.activeSilverIsLive = result.isLive;
  }
  
  return resolved;
};

module.exports = {
  resolveGoldRate,
  resolveSilverRate,
  resolveMetalRates,
  isValidRate
};
