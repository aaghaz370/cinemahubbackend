const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.searchAll = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const regex = new RegExp(q, "i");

    const movies = await Movie.find({ title: regex })
      .select("title slug metadata.poster metadata.rating")
      .limit(10);

    const series = await Series.find({ title: regex })
      .select("title slug metadata.poster metadata.rating")
      .limit(10);

    res.json({
      movies,
      series
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
