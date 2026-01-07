const Movie = require("../models/Movie");
const Series = require("../models/Series");

exports.getTrending = async (req, res) => {
  try {
    console.log('🔥 TRENDING REQUEST RECEIVED');

    // ==================== SMART TRENDING ALGORITHM ====================
    // Goal: ALWAYS return exactly 16 items
    // Priority: Max 8 series, rest fill with movies
    // Exclude: Top 10 Movies/Series from last 15 days
    // ==================================================================

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    // Step 1: Get Top 10 IDs to exclude
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

    console.log('📊 Top 10 Movies excluded:', excludeMovieIds.length);
    console.log('📊 Top 10 Series excluded:', excludeSeriesIds.length);

    // Step 2: Fetch available series (max 8)
    const availableSeries = await Series.find({
      _id: { $nin: excludeSeriesIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .select("title slug metadata.poster metadata.rating views createdAt");

    console.log('📺 Available Series fetched:', availableSeries.length);

    // Step 3: Calculate movies needed (16 total - series count)
    const moviesNeeded = 16 - availableSeries.length;

    console.log('🎯 Movies needed:', moviesNeeded);

    // Step 4: Fetch required movies
    const trendingMovies = await Movie.find({
      _id: { $nin: excludeMovieIds }
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(moviesNeeded)
      .select("title slug metadata.poster metadata.rating views createdAt");

    console.log('🎬 Movies fetched:', trendingMovies.length);

    // Step 5: Combine and sort
    const combined = [...availableSeries, ...trendingMovies];

    const trending = combined.sort((a, b) => {
      const viewsDiff = (b.views || 0) - (a.views || 0);
      if (viewsDiff !== 0) return viewsDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    console.log('✅ FINAL RESULT:', trending.length, 'items');
    console.log('   - Series:', availableSeries.length);
    console.log('   - Movies:', trendingMovies.length);

    res.json(trending);
  } catch (err) {
    console.error('❌ Trending error:', err);
    res.status(500).json({ error: err.message });
  }
};
