/**
 * Test endpoint to check TMDB data
 */

const { fetchMovieExtras } = require('../helpers/tmdb.helper');
const Movie = require('../models/Movie');

exports.testTmdbData = async (req, res) => {
    try {
        // Get first movie
        const movie = await Movie.findOne({});

        if (!movie) {
            return res.json({ error: 'No movies in database' });
        }

        console.log(`\n🎬 Testing TMDB for: ${movie.title} (TMDB: ${movie.tmdbId})\n`);

        // Fetch from TMDB
        const { watchProviders, videos } = await fetchMovieExtras(movie.tmdbId);

        console.log('Watch Providers:', JSON.stringify(watchProviders, null, 2));
        console.log('Videos:', JSON.stringify(videos, null, 2));

        // Check what's in database
        const currentData = {
            database: {
                watchProviders: movie.metadata?.watchProviders,
                videos: movie.metadata?.videos
            },
            tmdb: {
                watchProviders,
                videos
            }
        };

        res.json({
            success: true,
            movie: {
                title: movie.title,
                tmdbId: movie.tmdbId
            },
            data: currentData
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

// Test manual save
exports.testManualSave = async (req, res) => {
    try {
        const movie = await Movie.findOne({});

        if (!movie) {
            return res.json({ error: 'No movies' });
        }

        console.log(`\n🔧 Manual Save Test: ${movie.title}\n`);

        // Fetch from TMDB
        const { watchProviders, videos } = await fetchMovieExtras(movie.tmdbId);

        console.log('TMDB Data:', JSON.stringify(watchProviders, null, 2));

        // Save like migration does
        if (watchProviders) {
            movie.metadata.watchProviders = watchProviders;
            movie.markModified('metadata.watchProviders');
            console.log('✅ Marked modified');
        }

        await movie.save();
        console.log('✅ Saved');

        // Re-fetch from database
        const saved = await Movie.findById(movie._id);

        res.json({
            success: true,
            movie: movie.title,
            beforeSave: watchProviders,
            afterSave: saved.metadata?.watchProviders,
            saved: !!saved.metadata?.watchProviders?.flatrate?.length
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
