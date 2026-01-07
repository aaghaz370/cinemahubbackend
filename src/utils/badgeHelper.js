const Season = require('../models/Season');
const Episode = require('../models/Episode');

/**
 * Middleware to enhance series with latest season/episode dates
 * This populates _latestSeasonDate and _latestEpisodeDate for badge calculation
 */
async function enhanceSeriesWithBadgeData(series) {
    if (!series || !series.seasons || series.seasons.length === 0) {
        return series;
    }

    try {
        // Get all seasons for this series
        const seasons = await Season.find({
            _id: { $in: series.seasons }
        }).sort({ createdAt: -1 }).limit(1);

        if (seasons.length > 0) {
            // Set latest season date
            series._latestSeasonDate = seasons[0].createdAt;

            // Get latest episode from all seasons
            if (seasons[0].episodes && seasons[0].episodes.length > 0) {
                const Episode = require('../models/Episode');
                const latestEpisode = await Episode.findOne({
                    _id: { $in: seasons[0].episodes }
                }).sort({ createdAt: -1 });

                if (latestEpisode) {
                    series._latestEpisodeDate = latestEpisode.createdAt;
                }
            }
        }
    } catch (error) {
        console.error('Error enhancing series badge data:', error);
    }

    return series;
}

/**
 * Batch enhance multiple series
 */
async function enhanceMultipleSeriesWithBadgeData(seriesArray) {
    if (!Array.isArray(seriesArray) || seriesArray.length === 0) {
        return seriesArray;
    }

    return Promise.all(
        seriesArray.map(series => enhanceSeriesWithBadgeData(series))
    );
}

module.exports = {
    enhanceSeriesWithBadgeData,
    enhanceMultipleSeriesWithBadgeData
};
