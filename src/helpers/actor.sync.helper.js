/**
 * Actor Sync Helper
 * Automatically sync actors when movies/series are added
 */

const Actor = require('../models/Actor');

/**
 * Sync actors from a single movie's cast
 */
exports.syncActorsFromMovie = async (movie) => {
    try {
        if (!movie.metadata?.cast || movie.metadata.cast.length === 0) {
            return;
        }

        const bulkOps = movie.metadata.cast.slice(0, 10).map(castMember => {
            const actorId = castMember.tmdbId || castMember.id;

            // Skip if no valid ID
            if (!actorId || (typeof actorId === 'string' && actorId.match(/^[0-9a-fA-F]{24}$/))) {
                return null;
            }

            return {
                updateOne: {
                    filter: { tmdbId: actorId },
                    update: {
                        $set: {
                            tmdbId: actorId,
                            name: castMember.name,
                            profile_path: castMember.profile,
                            popularity: castMember.popularity || 0,
                            lastUpdated: new Date()
                        },
                        $addToSet: { movieIds: movie._id } // Add movie ID if not already present
                    },
                    upsert: true
                }
            };
        }).filter(Boolean); // Remove null entries

        if (bulkOps.length > 0) {
            await Actor.bulkWrite(bulkOps);
            console.log(`✅ Synced ${bulkOps.length} actors for movie: ${movie.title}`);
        }
    } catch (error) {
        console.error(`Failed to sync actors for movie ${movie.title}:`, error.message);
    }
};

/**
 * Sync actors from a single series' cast
 */
exports.syncActorsFromSeries = async (series) => {
    try {
        if (!series.metadata?.cast || series.metadata.cast.length === 0) {
            return;
        }

        const bulkOps = series.metadata.cast.slice(0, 10).map(castMember => {
            const actorId = castMember.tmdbId || castMember.id;

            // Skip if no valid ID
            if (!actorId || (typeof actorId === 'string' && actorId.match(/^[0-9a-fA-F]{24}$/))) {
                return null;
            }

            return {
                updateOne: {
                    filter: { tmdbId: actorId },
                    update: {
                        $set: {
                            tmdbId: actorId,
                            name: castMember.name,
                            profile_path: castMember.profile,
                            popularity: castMember.popularity || 0,
                            lastUpdated: new Date()
                        },
                        $addToSet: { seriesIds: series._id } // Add series ID if not already present
                    },
                    upsert: true
                }
            };
        }).filter(Boolean);

        if (bulkOps.length > 0) {
            await Actor.bulkWrite(bulkOps);
            console.log(`✅ Synced ${bulkOps.length} actors for series: ${series.title}`);
        }
    } catch (error) {
        console.error(`Failed to sync actors for series ${series.title}:`, error.message);
    }
};
