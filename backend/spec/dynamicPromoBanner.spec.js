const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const HomepageSection = require('../src/models/HomepageSection');
const sectionController = require('../src/modules/admin/controllers/section.controller');

// Mock findOneAndUpdate to return the updated object immediately without network dependencies
HomepageSection.findOneAndUpdate = async (lookup, update) => {
  return update.$set;
};

const makeMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
};

test('Backend Dynamic Promo Banner Validation & Sanitization Suite', async (t) => {
  await t.test('Case 6: Attempt save without desktop image must fail with 400', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            mobileImage: 'https://example.com/mobile.jpg'
            // missing desktop image
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Desktop image is required/i);
  });

  await t.test('Case 7: Attempt save without mobile image must fail with 400', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg'
            // missing mobile image
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Mobile image is required/i);
  });

  await t.test('Case 1 & 8: Desktop image + Mobile image only with empty optional fields must save successfully', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg',
            mobileImage: 'https://example.com/mobile.jpg',
            name: '',
            tag: '',
            label: '',
            subtitle: '',
            ctaLabel: '',
            path: ''
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    const savedItem = res.body.data.section.items[0];
    assert.equal(savedItem.image, 'https://example.com/desktop.jpg');
    assert.equal(savedItem.mobileImage, 'https://example.com/mobile.jpg');
    // Ensure optional empty fields are omitted
    assert.equal(savedItem.name, undefined);
    assert.equal(savedItem.tag, undefined);
    assert.equal(savedItem.label, undefined);
    assert.equal(savedItem.subtitle, undefined);
    assert.equal(savedItem.ctaLabel, undefined);
  });

  await t.test('Case 2: Desktop + Mobile + Title', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg',
            mobileImage: 'https://example.com/mobile.jpg',
            label: 'Festive Gold Specials'
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.section.items[0].label, 'Festive Gold Specials');
    assert.equal(res.body.data.section.items[0].subtitle, undefined);
    assert.equal(res.body.data.section.items[0].ctaLabel, undefined);
  });

  await t.test('Case 3: Desktop + Mobile + Title + Subtitle', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg',
            mobileImage: 'https://example.com/mobile.jpg',
            label: 'Festive Gold Specials',
            subtitle: 'Exclusive handcrafted sets'
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.section.items[0].label, 'Festive Gold Specials');
    assert.equal(res.body.data.section.items[0].subtitle, 'Exclusive handcrafted sets');
    assert.equal(res.body.data.section.items[0].ctaLabel, undefined);
  });

  await t.test('Case 4: Desktop + Mobile + CTA', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg',
            mobileImage: 'https://example.com/mobile.jpg',
            ctaLabel: 'Shop Now',
            path: '/shop?metal=gold'
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.section.items[0].ctaLabel, 'Shop Now');
    assert.equal(res.body.data.section.items[0].path, '/shop?metal=gold');
    assert.equal(res.body.data.section.items[0].label, undefined);
    assert.equal(res.body.data.section.items[0].subtitle, undefined);
  });

  await t.test('Case 5 & 9: Existing fully populated banner continues working with all fields', async () => {
    const req = {
      params: { id: 'dynamic-promo-banner' },
      query: {},
      body: {
        pageKey: 'home',
        sectionKey: 'dynamic-promo-banner',
        label: 'Dynamic Promo Banner',
        items: [
          {
            image: 'https://example.com/desktop.jpg',
            mobileImage: 'https://example.com/mobile.jpg',
            name: 'Eyebrow Brand',
            tag: 'Royal Atelier',
            label: 'Timeless Royal Jewels',
            subtitle: 'Handcrafted heirlooms designed for life.',
            ctaLabel: 'Explore Atelier',
            path: '/shop?collection=royal'
          }
        ]
      }
    };
    const res = makeMockRes();
    await sectionController.upsertSection(req, res);

    assert.equal(res.statusCode, 200);
    const item = res.body.data.section.items[0];
    assert.equal(item.image, 'https://example.com/desktop.jpg');
    assert.equal(item.mobileImage, 'https://example.com/mobile.jpg');
    assert.equal(item.name, 'Eyebrow Brand');
    assert.equal(item.tag, 'Royal Atelier');
    assert.equal(item.label, 'Timeless Royal Jewels');
    assert.equal(item.subtitle, 'Handcrafted heirlooms designed for life.');
    assert.equal(item.ctaLabel, 'Explore Atelier');
    assert.equal(item.path, '/shop?collection=royal');
  });
});
