const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getUnifiedContent = async (req, res) => {
  try {
    // Fetch ALL movies and series - no limit for proper search
    const moviesRaw = await Movie.find()
      .sort({ createdAt: -1 })
      .select("title slug metadata.poster metadata.rating metadata.genres metadata.overview metadata.language createdAt")
      .lean();

    const seriesRaw = await Series.find()
      .sort({ createdAt: -1 })
      .select("title slug metadata.poster metadata.rating metadata.genres metadata.overview metadata.language seasons createdAt")
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
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
