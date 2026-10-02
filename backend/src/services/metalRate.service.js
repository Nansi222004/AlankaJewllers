const axios = require("axios");

const SOURCE = "API Mitra";
const DEFAULT_TIMEOUT_MS = 8000;
const CITY_LIST_TTL_MS = 24 * 60 * 60 * 1000;

class MetalRateError extends Error {
  constructor(message, { code = "METAL_RATES_UNAVAILABLE", status = 503 } = {}) {
    super(message);
    this.name = "MetalRateError";
    this.code = code;
    this.status = status;
  }
}

const positiveNumber = (value, field) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new MetalRateError(`API Mitra returned an invalid ${field}`);
  }
  return parsed;
};

const normalizeCityKey = (value) => String(value || "")
  .trim()
  .toLocaleLowerCase("en-IN")
  .replace(/\s+/g, " ");

const titleCase = (value) => String(value || "")
  .trim()
  .toLocaleLowerCase("en-IN")
  .replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("en-IN"));

const displayCityName = (value) => {
  const normalized = normalizeCityKey(value);
  if (normalized === "bombay") return "Mumbai";
  return titleCase(value);
};

const firstDataRow = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data[0];
  if (payload?.data && typeof payload.data === "object") return payload.data;
  if (payload?.price && typeof payload.price === "object") return payload.price;
  return null;
};

const normalizeGoldResponse = (payload) => {
  const row = firstDataRow(payload);
  if (payload?.status !== "ok" || !row) {
    throw new MetalRateError("Gold rate is unavailable for this city", {
      code: "UNSUPPORTED_CITY",
      status: 404,
    });
  }

  const unit24k = String(row.unit || "").trim();
  if (!unit24k) throw new MetalRateError("API Mitra gold unit is missing");

  const details = row.details && typeof row.details === "object" ? row.details : {};
  const derivedUnit = unit24k === "per_gram_24k" ? "per_gram" : unit24k;

  return {
    location: displayCityName(row.location),
    locationType: row.location_type || "city",
    rates: {
      "24K": { rate: positiveNumber(row.price, "gold 24K price"), unit: unit24k },
      "22K": { rate: positiveNumber(row.price_22k ?? details.price_22k, "gold 22K price"), unit: derivedUnit },
      "18K": { rate: positiveNumber(row.price_18k ?? details.price_18k, "gold 18K price"), unit: derivedUnit },
    },
    updatedAt: row.updated_at || payload.updated_at || null,
  };
};

const normalizeSilverResponse = (payload) => {
  const row = firstDataRow(payload);
  if (payload?.status !== "ok" || !row) {
    throw new MetalRateError("Silver rate is unavailable for this city", {
      code: "UNSUPPORTED_CITY",
      status: 404,
    });
  }

  const upstreamUnit = String(row.unit || "").trim();
  if (!upstreamUnit) throw new MetalRateError("API Mitra silver unit is missing");
  const normalizedUnit = upstreamUnit.toLowerCase();
  if (!["per_10g", "per_10gram", "per_10grams"].includes(normalizedUnit)) {
    throw new MetalRateError("API Mitra returned an invalid silver unit");
  }
  const unit = "per_10g";

  return {
    location: displayCityName(row.location),
    locationType: row.location_type || "city",
    rate: { rate: positiveNumber(row.price, "silver price"), unit },
    // API Mitra's documented payload does not identify a silver purity.
    purity: null,
    updatedAt: row.updated_at || payload.updated_at || null,
  };
};

const extractCityRecords = (payload) => {
  const records = [];
  const add = (raw, inheritedState = "India", metal = null) => {
    if (typeof raw === "string") {
      records.push({ name: raw, apiCity: raw, state: inheritedState, metal });
      return;
    }
    if (!raw || typeof raw !== "object") return;
    const state = raw.state || raw.state_name || inheritedState || "India";
    const name = raw.city || raw.name || raw.location;
    if (name && !Array.isArray(raw.cities) && (raw.type === undefined || raw.type === "city" || raw.location_type === "city")) {
      records.push({
        name,
        apiCity: raw.id || raw.slug || raw.identifier || raw.city || raw.name || raw.location,
        state,
        metal: raw.metal || metal,
      });
    }
    if (Array.isArray(raw.cities)) raw.cities.forEach((city) => add(city, state, metal));
  };

  if (Array.isArray(payload?.cities)) payload.cities.forEach((city) => add(city));
  if (Array.isArray(payload?.locations)) payload.locations.forEach((city) => add(city));
  if (Array.isArray(payload?.data)) payload.data.forEach((city) => add(city));
  if (payload?.gold && Array.isArray(payload.gold)) payload.gold.forEach((city) => add(city, "India", "gold"));
  if (payload?.silver && Array.isArray(payload.silver)) payload.silver.forEach((city) => add(city, "India", "silver"));
  if (payload?.metals?.gold && Array.isArray(payload.metals.gold)) payload.metals.gold.forEach((city) => add(city, "India", "gold"));
  if (payload?.metals?.silver && Array.isArray(payload.metals.silver)) payload.metals.silver.forEach((city) => add(city, "India", "silver"));
  if (Array.isArray(payload?.states)) payload.states.forEach((state) => add(state, state.name || state.state));
  return records;
};

const normalizeCitiesResponse = (payload) => {
  if (payload?.status !== "ok") throw new MetalRateError("Supported cities are unavailable");
  const byCity = new Map();

  for (const record of extractCityRecords(payload)) {
    const key = normalizeCityKey(record.name) === "bombay" ? "mumbai" : normalizeCityKey(record.name);
    if (!key || key === "india") continue;
    const current = byCity.get(key);
    const metals = new Set(current?.metals || []);
    if (record.metal === "gold" || record.metal === "silver") metals.add(record.metal);
    byCity.set(key, {
      name: displayCityName(record.name),
      apiCity: String(record.apiCity || record.name).trim(),
      state: titleCase(record.state || "India"),
      metals: [...metals],
    });
  }

  if (!byCity.size) throw new MetalRateError("API Mitra returned no supported cities");

  const states = new Map();
  [...byCity.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "en-IN"))
    .forEach((city) => {
      if (!states.has(city.state)) states.set(city.state, []);
      states.get(city.state).push(city);
    });

  return [...states.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en-IN"))
    .map(([state, cities]) => ({ state, cities }));
};

class MetalRateService {
  constructor({ httpClient, now = () => Date.now(), apiKey } = {}) {
    const baseURL = process.env.APIMITRA_BASE_URL || "https://api.apimitra.in";
    this.http = httpClient || axios.create({ baseURL, timeout: DEFAULT_TIMEOUT_MS });
    this.now = now;
    this.apiKey = apiKey;
    this.cache = new Map();
    this.inflight = new Map();
    this.citiesCache = null;
  }

  isEnabled() {
    return String(process.env.APIMITRA_ENABLED ?? "true").toLowerCase() === "true";
  }

  ttlMs() {
    const minutes = Number(process.env.APIMITRA_CACHE_TTL_MINUTES || 30);
    return Math.max(1, Number.isFinite(minutes) ? minutes : 30) * 60 * 1000;
  }

  defaultCity() {
    return String(process.env.APIMITRA_DEFAULT_CITY || "Indore").trim();
  }

  headers() {
    const apiKey = String(this.apiKey ?? process.env.APIMITRA_API_KEY ?? "").trim();
    return apiKey ? { "x-api-key": apiKey } : {};
  }

  async request(path, params) {
    if (!this.isEnabled()) throw new MetalRateError("Metal rates are disabled");
    try {
      const response = await this.http.get(path, { params, headers: this.headers() });
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        throw new MetalRateError("API Mitra authentication is required", {
          code: "APIMITRA_AUTH_REQUIRED",
          status: 503,
        });
      }
      if (status === 404) {
        throw new MetalRateError("City is not supported by API Mitra", {
          code: "UNSUPPORTED_CITY",
          status: 404,
        });
      }
      throw new MetalRateError("API Mitra request failed");
    }
  }

  async fetchMetal(metal, city) {
    const payload = await this.request("/commodities", { metal, city });
    return metal === "gold" ? normalizeGoldResponse(payload) : normalizeSilverResponse(payload);
  }

  buildPayload(city, goldResult, silverResult, previous) {
    const gold = goldResult.status === "fulfilled" ? goldResult.value : previous?.goldData;
    const silver = silverResult.status === "fulfilled" ? silverResult.value : previous?.silverData;
    if (!gold && !silver) {
      const failures = [goldResult.reason, silverResult.reason].filter(Boolean);
      const unsupported = failures.length > 0 && failures.every((failure) => failure?.code === "UNSUPPORTED_CITY");
      throw new MetalRateError(
        unsupported ? "City is not supported by API Mitra" : "Gold and silver rates are unavailable",
        unsupported ? { code: "UNSUPPORTED_CITY", status: 404 } : {},
      );
    }

    const fetchedAt = new Date(this.now()).toISOString();
    const goldLive = goldResult.status === "fulfilled";
    const silverLive = silverResult.status === "fulfilled";
    const updatedDates = [gold?.updatedAt, silver?.updatedAt].filter(Boolean).sort();
    return {
      success: true,
      source: SOURCE,
      city: gold?.location || silver?.location || displayCityName(city),
      currency: "INR",
      gold: gold?.rates || null,
      silver: silver?.rate || null,
      silverPurity: silver?.purity ?? null,
      updatedAt: updatedDates.at(-1) || null,
      fetchedAt,
      isLive: goldLive && silverLive,
      isStale: (!goldLive && Boolean(gold)) || (!silverLive && Boolean(silver)),
      availability: { gold: Boolean(gold), silver: Boolean(silver) },
      goldData: gold,
      silverData: silver,
    };
  }

  publicPayload(payload) {
    const { goldData, silverData, ...safe } = payload;
    return safe;
  }

  async refreshCity(city) {
    const key = normalizeCityKey(city || this.defaultCity());
    if (!key || key.length > 100) {
      throw new MetalRateError("A valid city is required", { code: "INVALID_CITY", status: 400 });
    }
    const previous = this.cache.get(key)?.value;
    const [goldResult, silverResult] = await Promise.allSettled([
      this.fetchMetal("gold", key),
      this.fetchMetal("silver", key),
    ]);
    const value = this.buildPayload(key, goldResult, silverResult, previous);
    this.cache.set(key, { value, expiresAt: this.now() + this.ttlMs() });
    return this.publicPayload(value);
  }

  async getRates(city) {
    const requestedCity = String(city || this.defaultCity()).trim();
    const key = normalizeCityKey(requestedCity);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > this.now()) return this.publicPayload(cached.value);
    if (this.inflight.has(key)) return this.inflight.get(key);

    const refresh = this.refreshCity(requestedCity)
      .catch((error) => {
        if (!cached?.value) throw error;
        return this.publicPayload({
          ...cached.value,
          isLive: false,
          isStale: true,
          staleReason: "API Mitra is temporarily unavailable",
        });
      })
      .finally(() => this.inflight.delete(key));
    this.inflight.set(key, refresh);
    return refresh;
  }

  async getCities() {
    if (this.citiesCache && this.citiesCache.expiresAt > this.now()) return this.citiesCache.value;
    try {
      const payload = await this.request("/commodities/cities");
      const states = normalizeCitiesResponse(payload);
      const value = {
        success: true,
        source: SOURCE,
        defaultCity: displayCityName(this.defaultCity()),
        states,
        fetchedAt: new Date(this.now()).toISOString(),
        isLive: true,
        isStale: false,
      };
      this.citiesCache = { value, expiresAt: this.now() + CITY_LIST_TTL_MS };
      return value;
    } catch (error) {
      if (!this.citiesCache?.value) throw error;
      return { ...this.citiesCache.value, isLive: false, isStale: true };
    }
  }

  async refreshExpiredCities() {
    const keys = [...this.cache.entries()]
      .filter(([, entry]) => entry.expiresAt <= this.now())
      .map(([key]) => key);
    await Promise.allSettled(keys.map((city) => this.getRates(city)));
    return keys.length;
  }

  clearCache() {
    this.cache.clear();
    this.inflight.clear();
    this.citiesCache = null;
  }
}

const metalRateService = new MetalRateService();

module.exports = {
  MetalRateError,
  MetalRateService,
  displayCityName,
  metalRateService,
  normalizeCitiesResponse,
  normalizeGoldResponse,
  normalizeSilverResponse,
};
