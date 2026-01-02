/**
 * Migration Controller
 * API endpoint to trigger TMDB extras migration
 */

const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { fetchMovieExtras, fetchSeriesExtras } = require('../helpers/tmdb.helper');

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ================= TRIGGER MIGRATION VIA API =================

exports.migrateTmdbExtras = async (req, res) => {
    try {
        // Set timeout to 10 minutes for long-running operation
        req.setTimeout(600000);

        console.log('🚀 Starting TMDB Extras Migration via API...');

        const results = {
            movies: { total: 0, updated: 0, failed: 0 },
            series: { total: 0, updated: 0, failed: 0 }
        };

        // ===== MIGRATE MOVIES =====
        const movies = await Movie.find({});
        results.movies.total = movies.length;

        for (const movie of movies) {
            try {
                const { watchProviders, videos } = await fetchMovieExtras(movie.tmdbId);

                if (watchProviders || videos.length > 0) {
                    if (watchProviders) {
                        movie.metadata.watchProviders = watchProviders;
                        movie.markModified('metadata.watchProviders'); // Tell Mongoose to track change
                    }
                    if (videos.length > 0) {
                        movie.metadata.videos = videos;
                        movie.markModified('metadata.videos'); // Tell Mongoose to track change
                    }
                    await movie.save();
                    results.movies.updated++;
                    console.log(`✅ Updated: ${movie.title}`);
                }
                await sleep(300); // Rate limiting
            } catch (error) {
                results.movies.failed++;
                console.error(`Movie failed: ${movie.title}`, error.message);
            }
        }

        // ===== MIGRATE SERIES =====
        const series = await Series.find({});
        results.series.total = series.length;

        for (const show of series) {
            try {
                const { watchProviders, videos } = await fetchSeriesExtras(show.tmdbId);

                if (watchProviders || videos.length > 0) {
                    if (watchProviders) {
                        show.metadata.watchProviders = watchProviders;
                        show.markModified('metadata.watchProviders');
                    }
                    if (videos.length > 0) {
                        show.metadata.videos = videos;
                        show.markModified('metadata.videos');
                    }
                    await show.save();
                    results.series.updated++;
                    console.log(`✅ Updated: ${show.title}`);
                }
                await sleep(300);
            } catch (error) {
                results.series.failed++;
                console.error(`Series failed: ${show.title}`, error.message);
            }
        }

        console.log('✅ Migration Complete!', results);

        res.json({
            success: true,
            message: 'TMDB Extras Migration Completed',
            results
        });

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            error: 'Migration failed',
            message: error.message
        });
    }
};

// ================= GET MIGRATION STATUS =================

exports.getMigrationStatus = async (req, res) => {
    try {
        const moviesWithProviders = await Movie.countDocuments({
            'metadata.watchProviders': { $exists: true, $ne: null }
        });
        const moviesWithVideos = await Movie.countDocuments({
            'metadata.videos.0': { $exists: true }
        });
        const totalMovies = await Movie.countDocuments();

        const seriesWithProviders = await Series.countDocuments({
            'metadata.watchProviders': { $exists: true, $ne: null }
        });
        const seriesWithVideos = await Series.countDocuments({
            'metadata.videos.0': { $exists: true }
        });
        const totalSeries = await Series.countDocuments();

        res.json({
            success: true,
            status: {
                movies: {
                    total: totalMovies,
                    withProviders: moviesWithProviders,
                    withVideos: moviesWithVideos,
                    percentage: totalMovies > 0 ? Math.round((moviesWithProviders / totalMovies) * 100) : 0
                },
                series: {
                    total: totalSeries,
                    withProviders: seriesWithProviders,
                    withVideos: seriesWithVideos,
                    percentage: totalSeries > 0 ? Math.round((seriesWithProviders / totalSeries) * 100) : 0
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
