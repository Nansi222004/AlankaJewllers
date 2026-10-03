import test from 'node:test';
import assert from 'node:assert/strict';
import {
    isPurchasablePrice,
    resolveCartQuantity,
    withCanonicalQuantity,
} from '../src/utils/cartIntegrity.js';

test('unavailable prices are never treated as sellable', () => {
    for (const value of [0, null, undefined, -1, Number.NaN, 'invalid']) {
        assert.equal(isPurchasablePrice(value), false);
    }
    assert.equal(isPurchasablePrice(1), true);
});

test('displayed quantity is the canonical checkout quantity', () => {
    assert.equal(resolveCartQuantity({ quantity: 1, qty: 2 }), 1);
    assert.equal(resolveCartQuantity({ quantity: 2, qty: 1 }), 2);
    assert.deepEqual(withCanonicalQuantity({ quantity: 1, qty: 2 }), { quantity: 1, qty: 1 });
});
