const { metalRateService } = require("../../../services/metalRate.service");

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
    return sendFailure(res, error);
  }
};

exports.getMetalRateCities = async (_req, res) => {
  try {
    const data = await metalRateService.getCities();
    return res.status(200).json(data);
  } catch (error) {
    return sendFailure(res, error);
  }
};
