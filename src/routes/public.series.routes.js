const express = require("express");
const router = express.Router();
const {
  getAllSeries,
  getSeriesBySlug
} = require("../controllers/public.series.controller");

router.get("/series", getAllSeries);
router.get("/series/:slug", getSeriesBySlug);

module.exports = router;
