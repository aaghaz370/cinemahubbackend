const Movie = require("../models/Movie");

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

