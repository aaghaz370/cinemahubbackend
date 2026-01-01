/**
 * TMDB Helper Functions
 * Fetches additional data (Watch Providers, Videos) from TMDB API
 */

const tmdb = require('../config/tmdb');

// ================= FETCH WATCH PROVIDERS (OTT PLATFORMS) =================

exports.fetchWatchProviders = async (tmdbId, type = 'movie') => {
    try {
        const endpoint = type === 'movie'
            ? `/movie/${tmdbId}/watch/providers`
            : `/tv/${tmdbId}/watch/providers`;

        const response = await tmdb.get(endpoint);
        const providers = response.data.results;

        // Get India's watch providers (or US as fallback)
        const inData = providers.IN || providers.US || {};

        return {
            flatrate: inData.flatrate || [],
            rent: inData.rent || [],
            buy: inData.buy || [],
            link: inData.link || ''
        };

    } catch (error) {
        console.error(`Failed to fetch watch providers for ${type} ${tmdbId}:`, error.message);
        return null;
    }
};

// ================= FETCH VIDEOS (TRAILERS, CLIPS, ETC.) =================

exports.fetchVideos = async (tmdbId, type = 'movie') => {
    try {
        const endpoint = type === 'movie'
            ? `/movie/${tmdbId}/videos`
            : `/tv/${tmdbId}/videos`;

        const response = await tmdb.get(endpoint);
        const videos = response.data.results;

        // Filter and format videos
        return videos.map(video => ({
            key: video.key,
            name: video.name,
            site: video.site,
            type: video.type,  // Trailer, Teaser, Clip, etc.
            official: video.official,
            size: video.size
        }));

    } catch (error) {
        console.error(`Failed to fetch videos for ${type} ${tmdbId}:`, error.message);
        return [];
    }
};

// ================= FETCH BOTH (COMBINED) =================

exports.fetchMovieExtras = async (tmdbId) => {
    const [watchProviders, videos] = await Promise.all([
        exports.fetchWatchProviders(tmdbId, 'movie'),
        exports.fetchVideos(tmdbId, 'movie')
    ]);

    return { watchProviders, videos };
};

exports.fetchSeriesExtras = async (tmdbId) => {
    const [watchProviders, videos] = await Promise.all([
        exports.fetchWatchProviders(tmdbId, 'tv'),
        exports.fetchVideos(tmdbId, 'tv')
    ]);

    return { watchProviders, videos };
};
