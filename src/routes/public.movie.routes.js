const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieBySlug
} = require("../controllers/public.movie.controller");

router.get("/movies", getAllMovies);
router.get("/movies/:slug", getMovieBySlug);

module.exports = router;
