const { metalRateService } = require("../../../services/metalRate.service");
const Setting = require("../../../models/Setting");

const positive = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const getAdminFallback = async (city) => {
  const settings = await Setting.findOne({}).select("metalRates metalPricingUpdatedAt updatedAt").lean();
  const rates = settings?.metalRates || {};
  const gold10g = rates.gold10g || {};
  const silver10g = rates.silver10g || {};
  const gold = {};

  for (const purity of ["14", "18", "22", "24"]) {
    const rate = positive(gold10g[`k${purity}`]);
    if (rate) gold[`${purity}K`] = { rate, unit: "per_10g" };
  }

  const silverRate = positive(silver10g.silverOther) || positive(silver10g.sterling925);
  const silver = silverRate ? { rate: silverRate, unit: "per_10g" } : null;
  if (!Object.keys(gold).length && !silver) return null;

  return {
    success: true,
    source: "Admin fallback",
    city: String(city || metalRateService.defaultCity()),
    currency: "INR",
    gold: Object.keys(gold).length ? gold : null,
    silver,
    silverPurity: silver ? (positive(silver10g.silverOther) ? 999 : 925) : null,
    updatedAt: settings.metalPricingUpdatedAt || settings.updatedAt || null,
    fetchedAt: new Date().toISOString(),
    isLive: false,
    isStale: true,
    staleReason: "Live metal rates are temporarily unavailable",
    availability: { gold: Object.keys(gold).length > 0, silver: Boolean(silver) },
  };
};

const sendFailure = (res, error) => res.status(error.status || 503).json({
  success: false,
  code: error.code || "METAL_RATES_UNAVAILABLE",
  message: error.status === 404 ? error.message : "Rate unavailable",
});

exports.getMetalRates = async (req, res) => {
  try {
    const data = await metalRateService.getRates(req.query.city);
    return res.status(200).json(data);
  } catch (error) {
    const fallback = await getAdminFallback(req.query.city);
    if (fallback) return res.status(200).json(fallback);
    return sendFailure(res, error);
  }
};

exports.getMetalRateCities = async (_req, res) => {
  try {
    const data = await metalRateService.getCities();
    return res.status(200).json(data);
  } catch (error) {
    const fallback = await getAdminFallback();
    if (!fallback) return sendFailure(res, error);
    const city = fallback.city;
    return res.status(200).json({
      success: true,
      source: fallback.source,
      defaultCity: city,
      states: [{ state: "Default", cities: [{ name: city, apiCity: city, state: "Default" }] }],
      fetchedAt: fallback.fetchedAt,
      isLive: false,
      isStale: true,
    });
  }
};
