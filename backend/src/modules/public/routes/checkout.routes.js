const router = require("express").Router();
const validate = require("../../../middlewares/validate");
const { checkoutQuoteSchema } = require("../../user/validators/order.validator");
const orderController = require("../../user/controllers/order.controller");

// Public carts can obtain current product prices and configured shipping.
// Coupons and gift cards remain authenticated-only inside the controller.
router.post("/quote", validate(checkoutQuoteSchema), orderController.getCheckoutQuote);

module.exports = router;
