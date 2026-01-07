const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getTrending = async (req, res) => {
  try {
    // ==================== SMART TRENDING ALGORITHM ====================
    // Goal: Show 16 trending items (prefer 8 movies + 8 series mix)
    // But flexible: if series < 8, fill with more movies
    // Exclude: Items in Top 10 Movies/Series (last 15 days)
    // ==================================================================

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Step 1: Get Top 10 IDs to exclude (last 15 days only)
    const [top10Movies, top10Series] = await Promise.all([
      Movie.find({ createdAt: { $gte: fifteenDaysAgo } })
        .sort({ views: -1, 'metadata.rating': -1 })
        .limit(10)
        .select('_id'),
      Series.find({ createdAt: { $gte: fifteenDaysAgo } })
        .sort({ views: -1, 'metadata.rating': -1 })
        .limit(10)
        .select('_id')
    ]);

    const excludeMovieIds = top10Movies.map(m => m._id);
    const excludeSeriesIds = top10Series.map(s => s._id);

    console.log('📊 Excluding Top 10 Movies:', excludeMovieIds.length);
    console.log('📊 Excluding Top 10 Series:', excludeSeriesIds.length);

    // Step 2: Fetch ALL available series (excluding Top 10)
    const allSeries = await Series.find({
      _id: { $nin: excludeSeriesIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .select("title slug metadata.poster metadata.rating views createdAt");

    console.log('📺 Available Series:', allSeries.length);

    // Step 3: Calculate how many movies we need
    const seriesCount = Math.min(allSeries.length, 8); // Max 8 series
    const moviesNeeded = 16 - seriesCount; // Fill remaining with movies

    console.log('🎯 Taking', seriesCount, 'series and', moviesNeeded, 'movies');

    // Step 4: Fetch required number of movies (excluding Top 10)
    const trendingMovies = await Movie.find({
      _id: { $nin: excludeMovieIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(moviesNeeded)
      .select("title slug metadata.poster metadata.rating views createdAt");

    console.log('🎬 Trending Movies:', trendingMovies.length);

    // Step 5: Combine series (all or max 8) + movies
    const selectedSeries = allSeries.slice(0, seriesCount);

    const trending = [...selectedSeries, ...trendingMovies]
      .sort((a, b) => {
        // Sort by views DESC, then by date DESC
        const viewsDiff = (b.views || 0) - (a.views || 0);
        if (viewsDiff !== 0) return viewsDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    console.log('✅ Total Trending:', trending.length, '(', selectedSeries.length, 'series +', trendingMovies.length, 'movies)');

    res.json(trending);
  } catch (err) {
    console.error('❌ Trending error:', err);
    res.status(500).json({ error: err.message });
  }
};
