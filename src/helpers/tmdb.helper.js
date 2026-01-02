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

        // Try multiple regions for better coverage
        const regions = ['IN', 'US', 'GB']; // India, US, UK
        let providerData = null;

        for (const region of regions) {
            if (providers[region] && (
                providers[region].flatrate?.length > 0 ||
                providers[region].rent?.length > 0 ||
                providers[region].buy?.length > 0
            )) {
                providerData = providers[region];
                console.log(`✅ Found providers in ${region} for ${type} ${tmdbId}`);
                break; // Found data, stop searching
            }
        }

        if (!providerData) {
            console.log(`⚠️  No providers found for ${type} ${tmdbId}`);
            return null; // No providers found in any region
        }

        return {
            flatrate: providerData.flatrate || [],
            rent: providerData.rent || [],
            buy: providerData.buy || [],
            link: providerData.link || ''
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
