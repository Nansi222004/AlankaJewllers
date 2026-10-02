import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateReferenceMetalValue,
    formatRateUnit,
    getVerifiedReferenceRate,
} from '../src/modules/user/utils/referenceMetalRate.js';

const rates = {
    success: true,
    gold: {
        '24K': { rate: 14437, unit: 'per_gram_24k' },
        '22K': { rate: 13225, unit: 'per_gram' },
        '18K': { rate: 10831, unit: 'per_gram' },
    },
    silver: { rate: 2100, unit: 'per_10g' },
};

test('shows a rate only for structured genuine material and supported purity', () => {
    assert.equal(getVerifiedReferenceRate({ material: 'Gold', goldCategory: '22' }, rates).rate, 13225);
    assert.equal(getVerifiedReferenceRate({ material: 'Silver', silverCategory: '999' }, rates).rate, 2100);
    assert.equal(getVerifiedReferenceRate({ material: 'Gold plated', goldCategory: '22' }, rates), null);
    assert.equal(getVerifiedReferenceRate({ material: 'Alloy', goldCategory: '22' }, rates), null);
    assert.equal(getVerifiedReferenceRate({ name: '22K Gold Ring' }, rates), null);
    assert.equal(getVerifiedReferenceRate({ material: 'Silver', silverCategory: '925' }, rates), null);
    assert.equal(getVerifiedReferenceRate({ material: 'Gold', goldCategory: '14' }, rates), null);
});

test('formats preserved API units and calculates only with matching units', () => {
    assert.equal(formatRateUnit('per_gram_24k'), '/ gram');
    assert.equal(formatRateUnit('per_10g'), '/ 10g');
    assert.equal(calculateReferenceMetalValue({
        rate: 100,
        rateUnit: 'per_gram',
        verifiedNetMetalWeight: 2,
        weightUnit: 'Grams',
    }), 200);
    assert.equal(calculateReferenceMetalValue({
        rate: 100,
        rateUnit: 'per_10g',
        verifiedNetMetalWeight: 2,
        weightUnit: 'Grams',
    }), null);
});
