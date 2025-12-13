const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const {
  addSeries,
  addSeason,
  addEpisode
} = require("../controllers/admin.series.controller");

// 🔐 ADMIN ONLY
router.post("/admin/series", auth, addSeries);
router.post("/admin/season", auth, addSeason);
router.post("/admin/episode", auth, addEpisode);

module.exports = router;

