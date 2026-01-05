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

// ================= TOP 10 (Last 15 days + Most Views) =================

exports.getTop10 = async (req, res) => {
  try {
    // Calculate date 15 days ago
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Fetch movies and series from last 15 days, sorted by views
    const movies = await Movie.find({
      createdAt: { $gte: fifteenDaysAgo }
    })
      .sort({ views: -1 }) // Most views first
      .limit(10);

    const series = await Series.find({
      createdAt: { $gte: fifteenDaysAgo }
    })
      .sort({ views: -1 })
      .limit(10);

    // Combine and sort by views
    let top10 = [...movies, ...series]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    // Fallback: If less than 10 items in last 15 days, fill with older content
    if (top10.length < 10) {
      const needed = 10 - top10.length;

      const olderContent = await Promise.all([
        Movie.find({
          createdAt: { $lt: fifteenDaysAgo }
        })
          .sort({ views: -1 })
          .limit(needed),
        Series.find({
          createdAt: { $lt: fifteenDaysAgo }
        })
          .sort({ views: -1 })
          .limit(needed)
      ]);

      const fillerContent = [...olderContent[0], ...olderContent[1]]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, needed);

      top10 = [...top10, ...fillerContent];
    }

    res.json({
      success: true,
      data: top10
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
