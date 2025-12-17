const Movie = require("../models/Movie");
const tmdb = require("../config/tmdb");
const slugify = require("slugify");

exports.addMovie = async (req, res) => {
  try {
    const { title, tmdbId, watch = [], download = [] } = req.body;

    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
      params: { append_to_response: "credits" }
    });

    // 🎭 CAST
    const cast = data.credits.cast.slice(0, 10).map(p => ({
      name: p.name,
      profile: p.profile_path,
      tmdbId: p.id
    }));

    // 🎬 DIRECTOR
    const directorData = data.credits.crew.find(
      c => c.job === "Director"
    );

    const director = directorData
      ? {
          name: directorData.name,
          profile: directorData.profile_path,
          tmdbId: directorData.id
        }
      : null;

    // 🏭 PRODUCERS
    const producers = data.credits.crew
      .filter(c => c.job === "Producer")
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        profile: p.profile_path,
        tmdbId: p.id
      }));

    const movie = await Movie.create({
      title,
      slug: slugify(title, { lower: true }),
      tmdbId,

      metadata: {
        poster: data.poster_path,
        backdrop: data.backdrop_path,
        overview: data.overview,
        genres: data.genres.map(g => g.name),
        rating: data.vote_average,
        language: data.original_language,
        runtime: data.runtime,

        originalTitle: data.original_title,
        budget: data.budget,
        revenue: data.revenue,
        countries: data.production_countries.map(c => c.name),

        cast,
        director,
        producers
      },

      watch,
      download
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
/* ===============================
   ADD MOVIE (already exists)
================================ */
// exports.addMovie = ...

/* ===============================
   UPDATE MOVIE (SAFE – AS IS)
   ✔ title
   ✔ metadata
   ✔ full watch replace
   ✔ full download replace
================================ */
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({
      message: "✅ Movie updated",
      movie
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   DELETE MOVIE
================================ */
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "🗑 Movie deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================================================
   WATCH SERVERS (Granular Control)
========================================================= */

/**
 * ➕ Add watch server
 */
exports.addWatchServer = async (req, res) => {
  const { server, url } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $push: { watch: { server, url } } },
    { new: true }
  );

  res.json({ message: "✅ Watch server added", movie });
};

/**
 * ✏️ Update watch server
 */
exports.updateWatchServer = async (req, res) => {
  const { oldServer, server, url } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id, "watch.server": oldServer },
    {
      $set: {
        "watch.$.server": server,
        "watch.$.url": url
      }
    },
    { new: true }
  );

  res.json({ message: "✏️ Watch server updated", movie });
};

/**
 * ❌ Remove watch server
 */
exports.deleteWatchServer = async (req, res) => {
  const { server } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $pull: { watch: { server } } },
    { new: true }
  );

  res.json({ message: "🗑 Watch server removed", movie });
};

/* =========================================================
   DOWNLOAD (QUALITY & SERVER CONTROL)
========================================================= */

/**
 * ➕ Add download quality
 */
exports.addDownloadQuality = async (req, res) => {
  const { quality, links } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        download: {
          quality,
          links: links || []
        }
      }
    },
    { new: true }
  );

  res.json({ message: "✅ Download quality added", movie });
};

/**
 * ❌ Remove download quality
 */
exports.deleteDownloadQuality = async (req, res) => {
  const { quality } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $pull: { download: { quality } } },
    { new: true }
  );

  res.json({ message: "🗑 Download quality removed", movie });
};

/**
 * ➕ Add server inside a quality
 */
exports.addDownloadServer = async (req, res) => {
  const { quality, server, url } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    {
      $push: {
        "download.$[q].links": { server, url }
      }
    },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );

  res.json({ message: "✅ Download server added", movie });
};

/**
 * ✏️ Update download server
 */
exports.updateDownloadServer = async (req, res) => {
  const { quality, oldServer, server, url } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        "download.$[q].links.$[l].server": server,
        "download.$[q].links.$[l].url": url
      }
    },
    {
      arrayFilters: [
        { "q.quality": quality },
        { "l.server": oldServer }
      ],
      new: true
    }
  );

  res.json({ message: "✏️ Download server updated", movie });
};

/**
 * ❌ Remove download server
 */
exports.deleteDownloadServer = async (req, res) => {
  const { quality, server } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    {
      $pull: {
        "download.$[q].links": { server }
      }
    },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );

  res.json({ message: "🗑 Download server removed", movie });
};

