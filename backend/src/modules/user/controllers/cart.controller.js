const User = require("../../../models/User");
const { success, error } = require("../../../utils/apiResponse");
const { mergeGuestCart, toPositiveQuantity } = require("../../../utils/cartMerge");

exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "cart.productId",
      select: "name slug productCode brand images variants status active",
    });
    
    if (!user) return error(res, "User not found", 404);

    return success(res, { cart: user.cart || [] }, "Cart retrieved");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { items } = req.body; // Expecting array of { productId, variantId, quantity }
    
    if (!Array.isArray(items)) {
      return error(res, "Items must be an array", 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { cart: items },
      { new: true }
    );

    return success(res, { cart: user.cart }, "Cart updated");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity, isGiftCard, price, name, image, personalization } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) return error(res, "User not found", 404);

    const existingItemIndex = user.cart.findIndex(
      (item) => 
        String(item.productId) === String(productId) && 
        String(item.variantId) === String(variantId)
    );

    if (existingItemIndex > -1) {
      user.cart[existingItemIndex].quantity += (quantity || 1);
    } else {
      user.cart.push({ 
        productId, 
        variantId, 
        quantity: quantity || 1,
        isGiftCard: isGiftCard || false,
        price: price || 0,
        name: name || "",
        image: image || "",
        personalization: personalization || null
      });
    }

    await user.save();
    return success(res, { cart: user.cart }, "Item added to cart");
  } catch (err) {
    return error(res, err.message);
  }
};

exports.syncCart = async (req, res) => {
  try {
    const { guestItems } = req.body; // Expecting array of { id, variantId, quantity, isGiftCard, price, name, image, personalization }
    
    if (!Array.isArray(guestItems)) {
      return error(res, "Guest items must be an array", 400);
    }

    const user = await User.findById(req.user.userId);
    if (!user) return error(res, "User not found", 404);

    // Merge logic: productId + variantId
    const mergedCart = mergeGuestCart(user.cart || [], guestItems).map((item) => ({
      productId: item.productId || item.id || item._id,
      variantId: item.variantId,
      quantity: toPositiveQuantity(item.quantity),
      isGiftCard: Boolean(item.isGiftCard),
      price: Number(item.price) || 0,
      name: item.name || "",
      image: item.image || "",
      personalization: item.personalization || null,
    }));

    user.cart = mergedCart;
    await user.save();

    return success(res, { cart: user.cart }, "Cart synced successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
