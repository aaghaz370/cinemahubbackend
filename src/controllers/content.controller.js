const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getUnifiedContent = async (req, res) => {
  try {
    // Fetch ALL movies and series - no limit for proper search
    const moviesRaw = await Movie.find()
      .sort({ updatedAt: -1 })
      .select("title slug metadata.poster metadata.rating metadata.genres metadata.overview metadata.language createdAt updatedAt")
      .lean();

    const seriesRaw = await Series.find()
      .sort({ updatedAt: -1 })
      .select("title slug metadata.poster metadata.rating metadata.genres metadata.overview metadata.language seasons createdAt updatedAt")
      .lean();

    const movies = moviesRaw.map(m => ({
      ...m,
      type: "movie"
    }));

    const series = seriesRaw.map(s => ({
      ...s,
      type: "series"
    }));

    const combined = [...movies, ...series].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
