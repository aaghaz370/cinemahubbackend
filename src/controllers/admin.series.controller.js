const Series = require("../models/Series");
const Season = require("../models/Season");
const Episode = require("../models/Episode");
const tmdb = require("../config/tmdb");
const slugify = require("slugify");

/**
 * ADD SERIES
 */
exports.addSeries = async (req, res) => {
  try {
    const { title, tmdbId } = req.body;

    const { data } = await tmdb.get(`/tv/${tmdbId}`, {
      params: { append_to_response: "credits" }
    });

    const series = await Series.create({
      title,
      slug: slugify(title, { lower: true }),
      tmdbId,
      metadata: {
        poster: data.poster_path,
        backdrop: data.backdrop_path,
        overview: data.overview,
        genres: data.genres.map(g => g.name),
        cast: data.credits.cast.slice(0, 8).map(c => c.name),
        rating: data.vote_average,
        language: data.original_language
      }
    });

    res.status(201).json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADD SEASON
 */
exports.addSeason = async (req, res) => {
  try {
    const { seriesId, seasonNumber } = req.body;

    const season = await Season.create({
      series: seriesId,
      seasonNumber
    });

    await Series.findByIdAndUpdate(seriesId, {
      $push: { seasons: season._id }
    });

    res.status(201).json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADD EPISODE
 */
exports.addEpisode = async (req, res) => {
  try {
    const { seasonId, episodeNumber, title, watch, download } = req.body;

    const episode = await Episode.create({
      season: seasonId,
      episodeNumber,
      title,
      watch: watch || [],
      download: download || []
    });

    await Season.findByIdAndUpdate(seasonId, {
      $push: { episodes: episode._id }
    });

    res.status(201).json(episode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
