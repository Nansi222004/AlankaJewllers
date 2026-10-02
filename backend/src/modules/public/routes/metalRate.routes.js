const router = require("express").Router();
const controller = require("../controllers/metalRate.controller");

router.get("/", controller.getMetalRates);
router.get("/cities", controller.getMetalRateCities);

module.exports = router;
