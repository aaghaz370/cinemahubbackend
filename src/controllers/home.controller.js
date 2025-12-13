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
