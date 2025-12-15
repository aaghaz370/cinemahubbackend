const Movie = require("../models/Movie");
const tmdb = require("../config/tmdb");

exports.getRecommendations = async (req, res) => {
  try {
    const { tmdbId, exclude } = req.query;

    // TMDB recommendations
    const { data } = await tmdb.get(`/movie/${tmdbId}/recommendations`);

    const tmdbIds = data.results.map(m => m.id);

    // Only movies that exist in our DB
    const movies = await Movie.find({
      tmdbId: { $in: tmdbIds },
      _id: { $ne: exclude }
    })
      .limit(10)
      .select("title slug metadata.poster metadata.rating");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

