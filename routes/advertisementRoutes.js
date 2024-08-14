const express = require("express");
const router = express.Router();
const advertisementController = require("../controllers/advertisementController");

router.post("/createAdvertisement", advertisementController.createAdvertisement);
router.get("/", advertisementController.getAdvertisements);

module.exports = router;
