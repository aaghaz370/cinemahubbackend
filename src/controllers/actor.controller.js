const Actor = require('../models/Actor');
const Movie = require('../models/Movie');
const Series = require('../models/Series');

/**
 * Get actor details by TMDB ID
 */
exports.getActorById = async (req, res) => {
    try {
        const { actorId } = req.params;

        let actor = await Actor.findOne({ tmdbId: actorId });

        if (!actor) {
            return res.status(404).json({
                success: false,
                error: 'Actor not found'
            });
        }

        // Get all movies and series featuring this actor
        const [movies, series] = await Promise.all([
            Movie.find({
                _id: { $in: actor.movieIds },
                isActive: true
            }).select('title slug poster metadata type createdAt'),
            Series.find({
                _id: { $in: actor.seriesIds },
                isActive: true
            }).select('title slug poster metadata type createdAt')
        ]);

        res.json({
            success: true,
            data: {
                actor,
                filmography: {
                    movies,
                    series,
                    total: movies.length + series.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching actor:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch actor data'
        });
    }
};

/**
 * Sync actors from existing content metadata
 * This will extract all actors from movie/series cast and create Actor documents
 */
exports.syncActorsFromContent = async (req, res) => {
    try {
        console.log('Starting actor sync...');

        const [movies, series] = await Promise.all([
            Movie.find({ 'metadata.cast': { $exists: true, $ne: [] } }).select('_id metadata.cast'),
            Series.find({ 'metadata.cast': { $exists: true, $ne: [] } }).select('_id metadata.cast')
        ]);

        const actorMap = new Map(); // tmdbId -> { data, movieIds, seriesIds }

        // Process movies
        for (const movie of movies) {
            if (!movie.metadata?.cast) continue;

            for (const castMember of movie.metadata.cast.slice(0, 10)) { // Top 10 cast
                if (!castMember.id) continue;

                if (!actorMap.has(castMember.id)) {
                    actorMap.set(castMember.id, {
                        tmdbId: castMember.id,
                        name: castMember.name,
                        profile_path: castMember.profile_path,
                        character: castMember.character,
                        popularity: castMember.popularity || 0,
                        known_for_department: castMember.known_for_department,
                        gender: castMember.gender,
                        movieIds: [],
                        seriesIds: []
                    });
                }
                actorMap.get(castMember.id).movieIds.push(movie._id);
            }
        }

        // Process series
        for (const show of series) {
            if (!show.metadata?.cast) continue;

            for (const castMember of show.metadata.cast.slice(0, 10)) {
                if (!castMember.id) continue;

                if (!actorMap.has(castMember.id)) {
                    actorMap.set(castMember.id, {
                        tmdbId: castMember.id,
                        name: castMember.name,
                        profile_path: castMember.profile_path,
                        character: castMember.character,
                        popularity: castMember.popularity || 0,
                        known_for_department: castMember.known_for_department,
                        gender: castMember.gender,
                        movieIds: [],
                        seriesIds: []
                    });
                }
                actorMap.get(castMember.id).seriesIds.push(show._id);
            }
        }

        // Bulk insert/update actors
        const bulkOps = Array.from(actorMap.values()).map(actorData => ({
            updateOne: {
                filter: { tmdbId: actorData.tmdbId },
                update: {
                    $set: {
                        ...actorData,
                        lastUpdated: new Date()
                    }
                },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await Actor.bulkWrite(bulkOps);
        }

        console.log(`Synced ${actorMap.size} actors from ${movies.length} movies and ${series.length} series`);

        res.json({
            success: true,
            message: 'Actors synced successfully',
            stats: {
                actorsSynced: actorMap.size,
                moviesProcessed: movies.length,
                seriesProcessed: series.length
            }
        });
    } catch (error) {
        console.error('Error syncing actors:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to sync actors',
            details: error.message
        });
    }
};

/**
 * Search actors
 */
exports.searchActors = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query too short'
            });
        }

        const actors = await Actor.find({
            name: { $regex: q, $options: 'i' }
        })
            .sort({ popularity: -1 })
            .limit(20)
            .select('tmdbId name profile_path known_for_department');

        res.json({
            success: true,
            data: actors
        });
    } catch (error) {
        console.error('Error searching actors:', error);
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
};
