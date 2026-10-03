const toPositiveQuantity = (value) => {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
};

const cartItemKey = (item = {}) =>
  `${String(item.productId || item.id || item._id || "")}::${String(item.variantId || "")}`;

// Guest and server carts can be two persisted views of the same cart during
// login. Collapse duplicates within each view, then take the larger quantity
// across views so an auth/persistence race cannot silently double an item.
const mergeGuestCart = (serverItems = [], guestItems = []) => {
  const collapse = (items) => {
    const map = new Map();
    for (const raw of items || []) {
      const source = typeof raw?.toObject === "function" ? raw.toObject() : raw;
      const key = cartItemKey(source);
      if (key === "::") continue;
      const normalized = {
        ...source,
        productId: source.productId || source.id || source._id,
        quantity: toPositiveQuantity(source.quantity ?? source.qty),
      };
      const existing = map.get(key);
      if (existing) existing.quantity += normalized.quantity;
      else map.set(key, normalized);
    }
    return map;
  };

  const server = collapse(serverItems);
  const guest = collapse(guestItems);
  for (const [key, guestItem] of guest) {
    const serverItem = server.get(key);
    if (!serverItem) server.set(key, guestItem);
    else server.set(key, {
      ...serverItem,
      ...guestItem,
      quantity: Math.max(serverItem.quantity, guestItem.quantity),
    });
  }
  return Array.from(server.values());
};

module.exports = { toPositiveQuantity, cartItemKey, mergeGuestCart };
