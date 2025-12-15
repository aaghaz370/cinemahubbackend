const Movie = require("../models/Movie");
const Series = require("../models/Series");

/**
 * GET /person/:tmdbId
 * Actor / Director / Producer detail + available content
 */
exports.getPersonDetail = async (req, res) => {
  try {
    const { tmdbId } = req.params;

    // Movies where person exists
    const movies = await Movie.find({
      $or: [
        { "metadata.cast.tmdbId": tmdbId },
        { "metadata.director.tmdbId": tmdbId },
        { "metadata.producer.tmdbId": tmdbId }
      ]
    }).select("title slug metadata.poster metadata.rating");

    // Series where person exists
    const series = await Series.find({
      $or: [
        { "metadata.cast.tmdbId": tmdbId },
        { "metadata.director.tmdbId": tmdbId },
        { "metadata.producer.tmdbId": tmdbId }
      ]
    }).select("title slug metadata.poster metadata.rating");

    // Extract person info from first match
    const source =
      movies[0]?.metadata?.cast?.find(p => p.tmdbId == tmdbId) ||
      series[0]?.metadata?.cast?.find(p => p.tmdbId == tmdbId) ||
      movies[0]?.metadata?.director ||
      series[0]?.metadata?.director ||
      movies[0]?.metadata?.producer?.find(p => p.tmdbId == tmdbId) ||
      series[0]?.metadata?.producer?.find(p => p.tmdbId == tmdbId);

    if (!source) {
      return res.status(404).json({ message: "Person not found" });
    }

    res.json({
      person: {
        tmdbId: source.tmdbId,
        name: source.name,
        profile: source.profile,
        role: source.role
      },
      movies,
      series
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
