const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending.controller');

// Main trending endpoint
router.get('/', trendingController.getTrending);

// Debug endpoint - check series count
router.get('/debug', async (req, res) => {
  const Series = require('../models/Series');
  const Movie = require('../models/Movie');

  const seriesCount = await Series.countDocuments();
  const movieCount = await Movie.countDocuments();

  const sampleSeries = await Series.find().limit(3).select('title slug');
  const sampleMovies = await Movie.find().limit(3).select('title slug');

  res.json({
    totalSeries: seriesCount,
    totalMovies: movieCount,
    sampleSeries,
    sampleMovies
  });
});

module.exports = router;
