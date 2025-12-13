const Series = require("../models/Series");

exports.getAllSeries = async (req, res) => {
  const series = await Series.find()
    .sort({ createdAt: -1 })
    .select("title slug metadata.poster metadata.rating");

  res.json(series);
};

exports.getSeriesBySlug = async (req, res) => {
  const series = await Series.findOne({ slug: req.params.slug })
    .populate({
      path: "seasons",
      populate: {
        path: "episodes"
      }
    });

  if (!series) return res.status(404).json({ message: "Not found" });

  res.json(series);
};
