const express = require("express");
const router = express.Router();
const {
  getAllMovies,
  getMovieBySlug,
  getTheatreMovies
} = require("../controllers/public.movie.controller");

// Important: Put specific routes BEFORE parameterized routes
router.get("/movies/theatre", getTheatreMovies);
router.get("/movies", getAllMovies);
router.get("/movies/:slug", getMovieBySlug);

module.exports = router;
