const { metalRateService } = require("./metalRate.service");

let timer = null;

const startMetalRateScheduler = () => {
  if (timer || !metalRateService.isEnabled()) return timer;
  const configured = Number(process.env.APIMITRA_REFRESH_INTERVAL_MINUTES || 30);
  const minutes = Math.max(1, Number.isFinite(configured) ? configured : 30);
  timer = setInterval(() => {
    metalRateService.refreshExpiredCities().catch(() => {
      // Best effort only. Public requests will use stale cache when refresh fails.
    });
  }, minutes * 60 * 1000);
  timer.unref?.();
  return timer;
};

const stopMetalRateScheduler = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

module.exports = { startMetalRateScheduler, stopMetalRateScheduler };
