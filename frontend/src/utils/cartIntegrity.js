export const isPurchasablePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0;
};

export const resolveCartQuantity = (item = {}) => {
  const primary = Number(item.quantity);
  if (Number.isInteger(primary) && primary > 0) return primary;
  const legacy = Number(item.qty);
  if (Number.isInteger(legacy) && legacy > 0) return legacy;
  return 1;
};

export const withCanonicalQuantity = (item = {}) => {
  const quantity = resolveCartQuantity(item);
  return { ...item, quantity, qty: quantity };
};
