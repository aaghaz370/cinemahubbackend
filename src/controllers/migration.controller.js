/**
 * Migration Controller
 * API endpoint to trigger TMDB extras migration
 */

const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { fetchMovieExtras, fetchSeriesExtras } = require('../helpers/tmdb.helper');
const tmdb = require("../config/tmdb");

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ================= MIGRATE LOGOS (NEW) ================= */
exports.migrateLogos = async (req, res) => {
    try {
        req.setTimeout(600000); // 10 mins timeout
        console.log('🚀 Starting Logo Migration...');

        const Movie = require('../models/Movie');
        const Series = require('../models/Series');

        let updatedMovies = 0;
        let updatedSeries = 0;

        // 1. MIGRATE MOVIES
        const movies = await Movie.find({});
        console.log(`🎬 Found ${movies.length} movies. Proccessing...`);

        for (const movie of movies) {
            if (movie.metadata?.logo) continue; // Skip if already has logo

            try {
                const { data } = await tmdb.get(`/movie/${movie.tmdbId}/images`, {
                    params: { include_image_language: "en,null" }
                });

                const logo = data.logos?.find(l => l.file_path?.endsWith('.png'))?.file_path;

                if (logo) {
                    await Movie.updateOne(
                        { _id: movie._id },
                        { $set: { "metadata.logo": logo } }
                    );
                    updatedMovies++;
                    process.stdout.write('.'); // Progress dot
                }
                await sleep(50); // Rate limit
            } catch (err) {
                console.error(`❌ Failed format movie ${movie.title}: ${err.message}`);
            }
        }
        console.log(`\n✅ Updated ${updatedMovies} movies with logos.`);

        // 2. MIGRATE SERIES
        const seriesList = await Series.find({});
        console.log(`📺 Found ${seriesList.length} series. Processing...`);

        for (const series of seriesList) {
            if (series.metadata?.logo) continue;

            try {
                const { data } = await tmdb.get(`/tv/${series.tmdbId}/images`, {
                    params: { include_image_language: "en,null" }
                });

                const logo = data.logos?.find(l => l.file_path?.endsWith('.png'))?.file_path;

                if (logo) {
                    await Series.updateOne(
                        { _id: series._id },
                        { $set: { "metadata.logo": logo } }
                    );
                    updatedSeries++;
                    process.stdout.write('.');
                }
                await sleep(50);
            } catch (err) {
                console.error(`❌ Failed format series ${series.title}: ${err.message}`);
            }
        }
        console.log(`\n✅ Updated ${updatedSeries} series with logos.`);

        res.json({
            success: true,
            message: `Migration check complete. Updated ${updatedMovies} movies & ${updatedSeries} series.`,
            stats: { updatedMovies, updatedSeries }
        });

    } catch (err) {
        console.error("Migration Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ================= TRIGGER MIGRATION VIA API =================

exports.migrateTmdbExtras = async (req, res) => {
    try {
        // Set timeout to 10 minutes for long-running operation
        req.setTimeout(600000);

        console.log('🚀 Starting TMDB Extras Migration via API...');

        // ===== FORCE RELOAD MODELS (Clear Mongoose cache safely) =====
        console.log('🔄 Reloading Mongoose models to ensure latest schema...');
        const mongoose = require('mongoose');

        // Delete existing models from Mongoose (safe cleanup)
        try {
            if (mongoose.models && mongoose.models.Movie) {
                delete mongoose.models.Movie;
            }
            if (mongoose.modelSchemas && mongoose.modelSchemas.Movie) {
                delete mongoose.modelSchemas.Movie;
            }
            if (mongoose.models && mongoose.models.Series) {
                delete mongoose.models.Series;
            }
            if (mongoose.modelSchemas && mongoose.modelSchemas.Series) {
                delete mongoose.modelSchemas.Series;
            }
        } catch (cleanupError) {
            console.log('⚠️  Model cleanup skipped:', cleanupError.message);
        }

        // Clear require cache
        delete require.cache[require.resolve('../models/Movie')];
        delete require.cache[require.resolve('../models/Series')];

        // Reload models
        const Movie = require('../models/Movie');
        const Series = require('../models/Series');
        console.log('✅ Models reloaded successfully');

        const results = {
            movies: {
                total: 0,
                updated: 0,
                noDataFromTMDB: 0,  // TMDB doesn't have provider data
                apiError: 0,        // Actual API/network errors
                alreadyHasData: 0   // Already has watchProviders
            },
            series: {
                total: 0,
                updated: 0,
                noDataFromTMDB: 0,
                apiError: 0,
                alreadyHasData: 0
            }
        };

        // ===== MIGRATE MOVIES =====
        const movies = await Movie.find({});
        results.movies.total = movies.length;

        for (const movie of movies) {
            try {
                // Skip if already has watchProviders
                if (movie.metadata?.watchProviders?.flatrate?.length > 0 ||
                    movie.metadata?.watchProviders?.rent?.length > 0 ||
                    movie.metadata?.watchProviders?.buy?.length > 0) {
                    results.movies.alreadyHasData++;
                    console.log(`⏭️  Skipped (already has data): ${movie.title}`);
                    await sleep(100); // Minimal delay
                    continue;
                }

                const { watchProviders, videos } = await fetchMovieExtras(movie.tmdbId);

                if (watchProviders || videos?.length > 0) {
                    // Use $set to completely replace fields (avoids corrupt data issues)
                    const updateFields = {};

                    if (watchProviders) {
                        updateFields['metadata.watchProviders'] = watchProviders;
                    }
                    if (videos?.length > 0) {
                        updateFields['metadata.videos'] = videos;
                    }

                    // Direct database update (bypasses Mongoose validation on existing corrupt data)
                    await Movie.updateOne(
                        { _id: movie._id },
                        { $set: updateFields }
                    );

                    results.movies.updated++;
                    console.log(`✅ Updated: ${movie.title} (Region: ${watchProviders?.region || 'N/A'})`);
                } else {
                    results.movies.noDataFromTMDB++;
                    console.log(`⚠️  No TMDB data: ${movie.title} (TMDB ID: ${movie.tmdbId})`);
                }
                await sleep(300); // Rate limiting
            } catch (error) {
                results.movies.apiError++;
                console.error(`❌ API Error for "${movie.title}" (ID: ${movie.tmdbId}):`);
                console.error(`   Message: ${error.message}`);
                console.error(`   Stack: ${error.stack?.split('\n')[0]}`);
                if (error.response) {
                    console.error(`   HTTP Status: ${error.response.status}`);
                    console.error(`   Response: ${JSON.stringify(error.response.data)}`);
                }
            }
        }

        // ===== MIGRATE SERIES =====
        const series = await Series.find({});
        results.series.total = series.length;

        for (const show of series) {
            try {
                // Skip if already has watchProviders
                if (show.metadata?.watchProviders?.flatrate?.length > 0 ||
                    show.metadata?.watchProviders?.rent?.length > 0 ||
                    show.metadata?.watchProviders?.buy?.length > 0) {
                    results.series.alreadyHasData++;
                    console.log(`⏭️  Skipped (already has data): ${show.title}`);
                    await sleep(100);
                    continue;
                }

                const { watchProviders, videos } = await fetchSeriesExtras(show.tmdbId);

                if (watchProviders || videos?.length > 0) {
                    // Use $set to completely replace fields (avoids corrupt data issues)
                    const updateFields = {};

                    if (watchProviders) {
                        updateFields['metadata.watchProviders'] = watchProviders;
                    }
                    if (videos?.length > 0) {
                        updateFields['metadata.videos'] = videos;
                    }

                    // Direct database update (bypasses Mongoose validation on existing corrupt data)
                    await Series.updateOne(
                        { _id: show._id },
                        { $set: updateFields }
                    );

                    results.series.updated++;
                    console.log(`✅ Updated: ${show.title} (Region: ${watchProviders?.region || 'N/A'})`);
                } else {
                    results.series.noDataFromTMDB++;
                    console.log(`⚠️  No TMDB data: ${show.title} (TMDB ID: ${show.tmdbId})`);
                }
                await sleep(300);
            } catch (error) {
                results.series.apiError++;
                console.error(`❌ API Error for "${show.title}" (ID: ${show.tmdbId}):`);
                console.error(`   Message: ${error.message}`);
                console.error(`   Stack: ${error.stack?.split('\n')[0]}`);
                if (error.response) {
                    console.error(`   HTTP Status: ${error.response.status}`);
                    console.error(`   Response: ${JSON.stringify(error.response.data)}`);
                }
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
