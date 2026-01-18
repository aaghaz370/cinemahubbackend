const Actor = require('../models/Actor');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const axios = require('axios');

/**
 * Get actor details by TMDB ID
 */
exports.getActorById = async (req, res) => {
    try {
        const { actorId } = req.params;

        // Try to find actor - handle both string and number IDs
        let actor = await Actor.findOne({
            $or: [
                { tmdbId: actorId },           // String match
                { tmdbId: parseInt(actorId) }  // Number match
            ]
        });

        if (!actor) {
            return res.status(404).json({
                success: false,
                error: 'Actor not found'
            });
        }

        // Fetch full actor details from TMDB if we don't have bio
        if (!actor.biography && process.env.TMDB_API_KEY) {
            try {
                const tmdbResponse = await axios.get(
                    `https://api.themoviedb.org/3/person/${actorId}?api_key=${process.env.TMDB_API_KEY}`
                );

                // Update actor with full details
                actor.biography = tmdbResponse.data.biography;
                actor.birthday = tmdbResponse.data.birthday;
                actor.place_of_birth = tmdbResponse.data.place_of_birth;
                actor.known_for_department = tmdbResponse.data.known_for_department;
                actor.gender = tmdbResponse.data.gender;
                await actor.save();
            } catch (tmdbError) {
                console.error('TMDB fetch failed, using basic data:', tmdbError.message);
            }
        }

        // Get all movies and series featuring this actor
        console.log('Fetching filmography for actor:', actorId);
        console.log('MovieIds:', actor.movieIds);
        console.log('SeriesIds:', actor.seriesIds);

        const [movies, series] = await Promise.all([
            Movie.find({
                _id: { $in: actor.movieIds }
            }).select('title slug poster metadata type createdAt'),
            Series.find({
                _id: { $in: actor.seriesIds }
            }).select('title slug poster metadata type createdAt')
        ]);

        console.log(`Found ${movies.length} movies and ${series.length} series`);

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
                // Use tmdbId field from cast data
                const actorId = castMember.tmdbId || castMember.id;

                // Skip if no ID or if ID looks like MongoDB ObjectId (24 hex chars)
                if (!actorId || typeof actorId === 'string' && actorId.match(/^[0-9a-fA-F]{24}$/)) {
                    continue;
                }

                if (!actorMap.has(actorId)) {
                    actorMap.set(actorId, {
                        tmdbId: actorId,
                        name: castMember.name,
                        profile_path: castMember.profile,
                        popularity: castMember.popularity || 0,
                        movieIds: [],
                        seriesIds: []
                    });
                }
                actorMap.get(actorId).movieIds.push(movie._id);
            }
        }

        // Process series
        for (const show of series) {
            if (!show.metadata?.cast) continue;

            for (const castMember of show.metadata.cast.slice(0, 10)) {
                // Use tmdbId field from cast data
                const actorId = castMember.tmdbId || castMember.id;

                // Skip if no ID or if ID looks like MongoDB ObjectId (24 hex chars)
                if (!actorId || typeof actorId === 'string' && actorId.match(/^[0-9a-fA-F]{24}$/)) {
                    continue;
                }

                if (!actorMap.has(actorId)) {
                    actorMap.set(actorId, {
                        tmdbId: actorId,
                        name: castMember.name,
                        profile_path: castMember.profile,
                        popularity: castMember.popularity || 0,
                        movieIds: [],
                        seriesIds: []
                    });
                }
                actorMap.get(actorId).seriesIds.push(show._id);
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
