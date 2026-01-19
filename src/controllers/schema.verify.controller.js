/**
 * Schema Verification Endpoint
 * Checks if the latest schema changes are loaded
 */

const mongoose = require('mongoose');

exports.verifySchema = async (req, res) => {
    try {
        const Movie = require('../models/Movie');
        const Series = require('../models/Series');

        // Get schema structure
        const movieVideosSchema = Movie.schema.path('metadata.videos');
        const seriesVideosSchema = Series.schema.path('metadata.videos');

        const movieProvidersSchema = Movie.schema.path('metadata.watchProviders.flatrate');
        const seriesProvidersSchema = Series.schema.path('metadata.watchProviders.flatrate');

        res.json({
            success: true,
            message: 'Schema verification complete',
            schemas: {
                movie: {
                    videos: movieVideosSchema ? 'EXISTS' : 'MISSING',
                    videosType: movieVideosSchema?.instance || 'N/A',
                    providers: movieProvidersSchema ? 'EXISTS' : 'MISSING',
                    providersType: movieProvidersSchema?.instance || 'N/A'
                },
                series: {
                    videos: seriesVideosSchema ? 'EXISTS' : 'MISSING',
                    videosType: seriesVideosSchema?.instance || 'N/A',
                    providers: seriesProvidersSchema ? 'EXISTS' : 'MISSING',
                    providersType: seriesProvidersSchema?.instance || 'N/A'
                },
                mongooseVersion: mongoose.version,
                deployTime: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};
