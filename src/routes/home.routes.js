const express = require("express");
const router = express.Router();
const { homeSections, getTop10Movies, getTop10Series } = require("../controllers/home.controller");

router.get("/home", homeSections);
router.get("/top10/movies", getTop10Movies);
router.get("/top10/series", getTop10Series);

module.exports = router;
