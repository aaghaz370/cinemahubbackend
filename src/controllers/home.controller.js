const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.homeSections = async (req, res) => {
  try {
    const latest = await Promise.all([
      Movie.find().sort({ createdAt: -1 }).limit(10),
      Series.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(12);

    const series = await Series.find()
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({
      latest: [...latest[0], ...latest[1]]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 12),
      movies,
      series
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= TOP 10 MOVIES (Last 15 days + Most Views) =================

exports.getTop10Movies = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Fetch movies from last 15 days
    let top10Movies = await Movie.find({
      createdAt: { $gte: fifteenDaysAgo }
    })
      .sort({ views: -1, 'metadata.rating': -1 })
      .limit(10);

    // Fallback: If less than 10 movies, fill with older high-view movies
    if (top10Movies.length < 10) {
      const needed = 10 - top10Movies.length;
      const olderMovies = await Movie.find({
        createdAt: { $lt: fifteenDaysAgo }
      })
        .sort({ views: -1, 'metadata.rating': -1 })
        .limit(needed);

      top10Movies = [...top10Movies, ...olderMovies];
    }

    res.json({
      success: true,
      data: top10Movies
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= TOP 10 SERIES (Last 15 days + Most Views) =================

exports.getTop10Series = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Fetch series from last 15 days
    let top10Series = await Series.find({
      createdAt: { $gte: fifteenDaysAgo }
    })
      .sort({ views: -1, 'metadata.rating': -1 })
      .limit(10);

    // Fallback: If less than 10 series, fill with older high-view series
    if (top10Series.length < 10) {
      const needed = 10 - top10Series.length;
      const olderSeries = await Series.find({
        createdAt: { $lt: fifteenDaysAgo }
      })
        .sort({ views: -1, 'metadata.rating': -1 })
        .limit(needed);

      top10Series = [...top10Series, ...olderSeries];
    }

    res.json({
      success: true,
      data: top10Series
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
