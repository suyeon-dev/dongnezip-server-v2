const express = require("express");
const router = express.Router();
const controller = require("../controller/Cmap");

router.get("/", controller.map);
router.post("/mapData", controller.mapData);

module.exports = router;
