const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MetalRateService,
  normalizeCitiesResponse,
  normalizeGoldResponse,
  normalizeSilverResponse,
} = require("../src/services/metalRate.service");
const { calculateReferenceMetalValue } = require("../src/utils/referenceMetalValue");

const goldPayload = (city = "Indore") => ({
  status: "ok",
  metal: "gold",
  count: 1,
  data: [{
    commodity: "gold",
    location: city,
    location_type: "city",
    unit: "per_gram_24k",
    price: "14437.00",
    details: { price_18k: 10831, price_22k: 13225 },
    updated_at: "2026-08-02T16:54:00.166Z",
  }],
});

const silverPayload = (city = "Indore") => ({
  status: "ok",
  metal: "silver",
  count: 1,
  data: [{
    commodity: "silver",
    location: city,
    location_type: "city",
    unit: "per_10gram",
    price: "2100.50",
    updated_at: "2026-08-02T16:54:00.166Z",
  }],
});

test("normalizes documented gold and silver response fields without inventing purity", () => {
  const gold = normalizeGoldResponse(goldPayload());
  const silver = normalizeSilverResponse(silverPayload());
  assert.deepEqual(gold.rates, {
    "24K": { rate: 14437, unit: "per_gram_24k" },
    "22K": { rate: 13225, unit: "per_gram" },
    "18K": { rate: 10831, unit: "per_gram" },
  });
  assert.equal(silver.rate.rate, 2100.5);
  assert.equal(silver.rate.unit, "per_10g");
  assert.equal(silver.purity, null);
});

test("rejects zero and malformed upstream rates", () => {
  assert.throws(() => normalizeGoldResponse({
    ...goldPayload(),
    data: [{ ...goldPayload().data[0], price: 0 }],
  }), /invalid gold 24K price/);
  assert.throws(() => normalizeGoldResponse({
    ...goldPayload(),
    data: [{ ...goldPayload().data[0], details: { price_18k: -1, price_22k: 13225 } }],
  }), /invalid gold 18K price/);
  assert.throws(() => normalizeGoldResponse({
    ...goldPayload(),
    data: [{ ...goldPayload().data[0], details: { price_18k: 10831, price_22k: "not-a-rate" } }],
  }), /invalid gold 22K price/);
  assert.throws(() => normalizeSilverResponse({
    ...silverPayload(),
    data: [{ ...silverPayload().data[0], price: -10 }],
  }), /invalid silver price/);
  assert.throws(() => normalizeSilverResponse({
    ...silverPayload(),
    data: [{ ...silverPayload().data[0], unit: "per_kg" }],
  }), /invalid silver unit/);
  assert.throws(() => normalizeSilverResponse({ status: "ok", data: [] }), /unavailable/);
});

test("normalizes dynamic state/city records and displays Bombay as Mumbai", () => {
  const states = normalizeCitiesResponse({
    status: "ok",
    states: [
      { name: "Maharashtra", cities: [{ name: "Bombay", slug: "bombay" }, "Pune"] },
      { name: "Madhya Pradesh", cities: ["Indore"] },
    ],
  });
  const maharashtra = states.find((group) => group.state === "Maharashtra");
  assert.deepEqual(maharashtra.cities.map((city) => city.name), ["Mumbai", "Pune"]);
  assert.equal(maharashtra.cities[0].apiCity, "bombay");
});

test("uses a city-aware cache and returns stale data after an upstream failure", async () => {
  let now = 1_000;
  let fail = false;
  const calls = [];
  const httpClient = {
    get: async (_path, config) => {
      calls.push(config);
      if (fail) throw new Error("network down");
      return { data: config.params.metal === "gold" ? goldPayload("Mumbai") : silverPayload("Mumbai") };
    },
  };
  const service = new MetalRateService({ httpClient, now: () => now });
  const first = await service.getRates("mumbai");
  const second = await service.getRates("Mumbai");
  assert.equal(first.isLive, true);
  assert.equal(second.gold["24K"].rate, 14437);
  assert.equal(calls.length, 2);

  now += 31 * 60 * 1000;
  fail = true;
  const stale = await service.getRates("mumbai");
  assert.equal(stale.isLive, false);
  assert.equal(stale.isStale, true);
  assert.equal(stale.gold["22K"].rate, 13225);
});

test("returns controlled unavailability when there is no cache", async () => {
  const service = new MetalRateService({
    httpClient: { get: async () => { throw new Error("offline"); } },
  });
  await assert.rejects(() => service.getRates("Indore"), /unavailable/);
});

test("sends an API key only through the server-side x-api-key header", async () => {
  const configs = [];
  const service = new MetalRateService({
    apiKey: "server-secret",
    httpClient: {
      get: async (_path, config) => {
        configs.push(config);
        return { data: config.params.metal === "gold" ? goldPayload() : silverPayload() };
      },
    },
  });
  const result = await service.getRates("Indore");
  assert.equal(configs.every((config) => config.headers["x-api-key"] === "server-secret"), true);
  assert.equal(JSON.stringify(result).includes("server-secret"), false);
});

test("reference metal value requires valid values and matching units", () => {
  assert.equal(calculateReferenceMetalValue({
    rate: 100,
    rateUnit: "per_gram",
    netMetalWeight: 2.5,
    weightUnit: "Grams",
  }), 250);
  assert.equal(calculateReferenceMetalValue({
    rate: 100,
    rateUnit: "per_10g",
    netMetalWeight: 2.5,
    weightUnit: "Grams",
  }), null);
});
