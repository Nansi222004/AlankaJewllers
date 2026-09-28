const router = require("express").Router();
const fcmTokenController = require("../controllers/fcmToken.controller");

// Route: /api/v1/fcm-tokens/save
router.post("/save", fcmTokenController.saveToken);

// Optional delete/remove route
router.post("/remove", fcmTokenController.removeToken);
router.delete("/", fcmTokenController.removeToken);

module.exports = router;
