const Movie = require('../models/Movie');
const Series = require('../models/Series');

/**
 * GET /api/hero-banner
 * Fetch up to 8 items marked for hero banner (movies + series combined)
 */
exports.getHeroBanner = async (req, res) => {
    try {
        // Fetch movies and series marked for hero banner
        const movies = await Movie.find({ isInHeroBanner: true })
            .select('title slug tmdbId metadata')
            .limit(8);

        const series = await Series.find({ isInHeroBanner: true })
            .select('title slug tmdbId metadata')
            .limit(8 - movies.length); // Remaining slots

        // Combine and return (max 8 total)
        const heroBanner = [...movies, ...series].slice(0, 8);

        res.json({
            success: true,
            count: heroBanner.length,
            items: heroBanner
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
