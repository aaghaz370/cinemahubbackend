const express = require("express");
const router = express.Router();

// const auth = require("../middlewares/auth.middleware");

const {
  addSeries,
  deleteSeries,
  addSeason,
  updateSeason,
  deleteSeason,
  addEpisode,
  updateEpisode,
  deleteEpisode,
  toggleHeroBanner
} = require("../controllers/admin.series.controller");

// 🔐 ADMIN ONLY - Series
router.post("/admin/series", addSeries);
router.delete("/admin/series/:id", deleteSeries);

// ⭐ Hero Banner Toggle
router.patch("/admin/series/:id/hero", toggleHeroBanner);

// Season
router.post("/admin/season", addSeason);
router.put("/admin/season/:id", updateSeason);
router.delete("/admin/season/:id", deleteSeason);

// Episode
router.post("/admin/episode", addEpisode);
router.put("/admin/episode/:id", updateEpisode);
router.delete("/admin/episode/:id", deleteEpisode);

module.exports = router;

