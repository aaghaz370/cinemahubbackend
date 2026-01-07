const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getTrending = async (req, res) => {
  try {
    // Step 1: Get Top 10 Movies and Series IDs to exclude them
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const top10Movies = await Movie.find({ createdAt: { $gte: fifteenDaysAgo } })
      .sort({ views: -1, 'metadata.rating': -1 })
      .limit(10)
      .select('_id');

    const top10Series = await Series.find({ createdAt: { $gte: fifteenDaysAgo } })
      .sort({ views: -1, 'metadata.rating': -1 })
      .limit(10)
      .select('_id');

    const excludeMovieIds = top10Movies.map(m => m._id);
    const excludeSeriesIds = top10Series.map(s => s._id);

    // Step 2: Get 8 trending movies (exclude Top 10)
    const trendingMovies = await Movie.find({
      _id: { $nin: excludeMovieIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .select("title slug metadata.poster metadata.rating views createdAt");

    // Step 3: Get 8 trending series (exclude Top 10)
    const trendingSeries = await Series.find({
      _id: { $nin: excludeSeriesIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .select("title slug metadata.poster metadata.rating views createdAt");

    // Step 4: Combine and sort by views DESC, then date DESC
    const trending = [...trendingMovies, ...trendingSeries]
      .sort((a, b) => {
        const viewsDiff = (b.views || 0) - (a.views || 0);
        if (viewsDiff !== 0) return viewsDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    res.json(trending);
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ error: err.message });
  }
};
