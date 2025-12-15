const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getRecommendations = async (req, res) => {
  try {
    const { type, genres, exclude } = req.query;

    if (!genres) {
      return res.json([]);
    }

    const genreArray = genres.split(",");

    let Model = type === "series" ? Series : Movie;

    const data = await Model.find({
      "metadata.genres": { $in: genreArray },
      _id: { $ne: exclude }
    })
      .limit(10)
      .select("title slug metadata.poster metadata.rating");

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
