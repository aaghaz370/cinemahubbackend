const express = require("express");
const router = express.Router();
const { homeSections, getTop10 } = require("../controllers/home.controller");

router.get("/home", homeSections);
router.get("/top10", getTop10);

module.exports = router;
