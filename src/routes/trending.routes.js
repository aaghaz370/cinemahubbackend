const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

router.get("/trending", async (req, res) => {
  try {
    const movies = await Movie.find()
      .sort({ views: -1, createdAt: -1 })
      .limit(12)
      .select("title slug metadata.poster metadata.rating");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
