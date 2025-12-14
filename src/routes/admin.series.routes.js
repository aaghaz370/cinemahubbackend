const express = require("express");
const router = express.Router();

// const auth = require("../middlewares/auth.middleware");

const {
  addSeries,
  addSeason,
  addEpisode
} = require("../controllers/admin.series.controller");

// 🔐 ADMIN ONLY
router.post("/admin/series",  addSeries);
router.post("/admin/season",  addSeason);
router.post("/admin/episode",  addEpisode);

module.exports = router;

