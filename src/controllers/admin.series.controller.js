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
 * DELETE SERIES (and all its seasons/episodes)
 */
exports.deleteSeries = async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ error: "Series not found" });

    // Delete all episodes in all seasons
    for (const seasonId of series.seasons) {
      const season = await Season.findById(seasonId);
      if (season) {
        await Episode.deleteMany({ _id: { $in: season.episodes } });
      }
    }

    // Delete all seasons
    await Season.deleteMany({ _id: { $in: series.seasons } });

    // Delete the series
    await Series.findByIdAndDelete(req.params.id);

    res.json({ message: "Series deleted successfully" });
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
      seasonNumber,
      download: []   // ✅ season-level download
    });


    // Update series and touch it to update updatedAt
    await Series.findByIdAndUpdate(seriesId, {
      $push: { seasons: season._id },
      $currentDate: { updatedAt: true }
    });

    res.status(201).json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE SEASON
 */
exports.updateSeason = async (req, res) => {
  try {
    const { seasonNumber } = req.body;

    const season = await Season.findByIdAndUpdate(
      req.params.id,
      { seasonNumber },
      { new: true }
    );

    if (!season) return res.status(404).json({ error: "Season not found" });

    res.json({ message: "Season updated", season });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE SEASON (and all its episodes)
 */
exports.deleteSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ error: "Season not found" });

    // Delete all episodes in this season
    await Episode.deleteMany({ _id: { $in: season.episodes } });

    // Remove season from series
    await Series.findByIdAndUpdate(season.series, {
      $pull: { seasons: season._id }
    });

    // Delete the season
    await Season.findByIdAndDelete(req.params.id);

    res.json({ message: "Season deleted successfully" });
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

    // Update season
    const season = await Season.findByIdAndUpdate(seasonId, {
      $push: { episodes: episode._id }
    });

    // Touch Series document to update its updatedAt timestamp
    if (season) {
      await Series.findByIdAndUpdate(season.series, {
        $currentDate: { updatedAt: true }
      });
    }

    res.status(201).json(episode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE EPISODE
 */
exports.updateEpisode = async (req, res) => {
  try {
    const { episodeNumber, title } = req.body;

    const episode = await Episode.findByIdAndUpdate(
      req.params.id,
      { episodeNumber, title },
      { new: true }
    );

    if (!episode) return res.status(404).json({ error: "Episode not found" });

    res.json({ message: "Episode updated", episode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE EPISODE
 */
exports.deleteEpisode = async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode) return res.status(404).json({ error: "Episode not found" });

    // Remove episode from season
    await Season.findByIdAndUpdate(episode.season, {
      $pull: { episodes: episode._id }
    });

    // Delete the episode
    await Episode.findByIdAndDelete(req.params.id);

    res.json({ message: "Episode deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
