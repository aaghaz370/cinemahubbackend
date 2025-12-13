const Movie = require("../models/Movie");
const Episode = require("../models/Episode");

exports.addMovieView = async (req, res) => {
  await Movie.findByIdAndUpdate(req.params.id, {
    $inc: { views: 1 }
  });
  res.json({ success: true });
};

exports.addEpisodeView = async (req, res) => {
  await Episode.findByIdAndUpdate(req.params.id, {
    $inc: { views: 1 }
  });
  res.json({ success: true });
};
