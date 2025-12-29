const Movie = require("../models/Movie");

/**
 * GET /movies
 * Home page / listing
 */
exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .select("title slug metadata.poster metadata.rating");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /movies/:slug
 * Movie detail page
 */
exports.getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug })
      .populate("metadata.cast")


    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /movies/theatre
 * Get movies currently in theatres
 */
exports.getTheatreMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ isInTheatre: true })
      .sort({ createdAt: -1 })
      .select("title slug metadata.poster metadata.rating metadata.genres");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
