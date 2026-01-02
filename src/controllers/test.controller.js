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
