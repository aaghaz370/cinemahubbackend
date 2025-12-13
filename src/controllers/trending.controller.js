const Movie = require("../models/Movie");

exports.getTrending = async (req, res) => {
  const trending = await Movie.find()
    .sort({ views: -1, createdAt: -1 })
    .limit(12)
    .select("title slug metadata.poster metadata.rating views");

  res.json(trending);
};
