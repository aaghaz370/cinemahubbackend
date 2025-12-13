const Movie = require("../models/Movie");

exports.getRecommendations = async (req, res) => {
  try {
    const { genre, exclude } = req.query;

    const movies = await Movie.find({
      "metadata.genres": genre,
      _id: { $ne: exclude }
    })
      .limit(10)
      .select("title slug metadata.poster metadata.rating");

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
