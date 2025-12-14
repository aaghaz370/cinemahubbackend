const express = require("express");
const router = express.Router();
const { getUnifiedContent } = require("../controllers/content.controller");
const Movie = require("../models/Movie");
const TvShow = require("../models/TvShow");

router.get("/content", getUnifiedContent);

// GET movie by slug
router.get("/movie/:slug", async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug }).lean();

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET tv show by slug
router.get("/tv/:slug", async (req, res) => {
  try {
    const tv = await TvShow.findOne({ slug: req.params.slug }).lean();

    if (!tv) {
      return res.status(404).json({ message: "TV show not found" });
    }

    res.json(tv);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
