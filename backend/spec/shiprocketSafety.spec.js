const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');

const originalCreate = axios.create;

const loadProvider = (client) => {
  axios.create = () => client;
  const modulePath = require.resolve('../src/services/shipping/shiprocket.service');
  delete require.cache[modulePath];
  const ShiprocketProvider = require(modulePath);
  const provider = new ShiprocketProvider();
  provider._getClient = async () => client;
  return provider;
};

test.afterEach(() => {
  axios.create = originalCreate;
});

test('schedulePickup sends the Shiprocket shipment id, not the AWB', async () => {
  let posted;
  const provider = loadProvider({
    post: async (url, body) => {
      posted = { url, body };
      return { data: { pickup_token_number: 'pickup-ref' } };
    },
  });

  const result = await provider.schedulePickup({
    shiprocketShipmentId: '12345',
    pickupDate: '2026-10-08',
  });

  assert.equal(posted.url, '/courier/generate/pickup');
  assert.deepEqual(posted.body.shipment_id, [12345]);
  assert.equal(result.pickupId, 'pickup-ref');
});

test('schedulePickup rejects failures instead of allowing a local success', async () => {
  const provider = loadProvider({ post: async () => { throw new Error('upstream unavailable'); } });
  await assert.rejects(
    provider.schedulePickup({ shiprocketShipmentId: '12345' }),
    /pickup scheduling failed/i,
  );
});

test('cancelShipment rejects failures instead of allowing a local cancellation', async () => {
  const provider = loadProvider({ post: async () => { throw new Error('upstream unavailable'); } });
  await assert.rejects(
    provider.cancelShipment({ shiprocketOrderId: '67890' }),
    /cancellation failed/i,
  );
});
