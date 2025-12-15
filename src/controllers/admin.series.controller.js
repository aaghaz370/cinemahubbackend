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

    const cast = data.credits.cast.slice(0, 10).map(c => ({
      tmdbId: c.id,
      name: c.name,
      profile: c.profile_path,
      role: c.character
    }));

    const director = data.credits.crew.find(p => p.job === "Director");

    const producers = data.credits.crew
      .filter(p => p.job === "Producer")
      .slice(0, 3)
      .map(p => ({
        tmdbId: p.id,
        name: p.name,
        profile: p.profile_path,
        role: "Producer"
      }));

    const series = await Series.create({
      title,
      slug: slugify(title, { lower: true }),
      tmdbId,
      metadata: {
        poster: data.poster_path,
        backdrop: data.backdrop_path,
        overview: data.overview,
        genres: data.genres.map(g => g.name),

        cast,
        director: director
          ? {
              tmdbId: director.id,
              name: director.name,
              profile: director.profile_path,
              role: "Director"
            }
          : null,

        producer: producers,

        rating: data.vote_average,
        language: data.original_language,
        originalTitle: data.original_name,
        countries: data.origin_country,
        companies: data.production_companies?.map(c => c.name)
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
