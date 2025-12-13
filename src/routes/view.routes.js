const express = require("express");
const router = express.Router();
const {
  addMovieView,
  addEpisodeView
} = require("../controllers/view.controller");

router.post("/view/movie/:id", addMovieView);
router.post("/view/episode/:id", addEpisodeView);

module.exports = router;
