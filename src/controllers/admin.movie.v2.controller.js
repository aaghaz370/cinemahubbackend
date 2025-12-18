const Movie = require("../models/Movie");

/* ================= WATCH ================= */

exports.addWatchServer = async (req, res) => {
  const { server, url } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $push: { watch: { server, url } } },
    { new: true }
  );

  res.json({ message: "✅ Watch server added", movie });
};

exports.updateWatchServer = async (req, res) => {
  const { oldServer, server, url } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id, "watch.server": oldServer },
    { $set: { "watch.$.server": server, "watch.$.url": url } },
    { new: true }
  );

  res.json({ message: "✏️ Watch server updated", movie });
};

exports.deleteWatchServer = async (req, res) => {
  const { server } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $pull: { watch: { server } } },
    { new: true }
  );

  res.json({ message: "🗑 Watch server removed", movie });
};

/* ================= DOWNLOAD ================= */

exports.addDownloadQuality = async (req, res) => {
  const { quality } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $push: { download: { quality, links: [] } } },
    { new: true }
  );

  res.json({ message: "✅ Quality added", movie });
};

exports.deleteDownloadQuality = async (req, res) => {
  const { quality } = req.body;

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { $pull: { download: { quality } } },
    { new: true }
  );

  res.json({ message: "🗑 Quality removed", movie });
};

exports.addDownloadServer = async (req, res) => {
  const { quality, server, url } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { "download.$[q].links": { server, url } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );

  res.json({ message: "✅ Download server added", movie });
};

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

exports.deleteDownloadServer = async (req, res) => {
  const { quality, server } = req.body;

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { "download.$[q].links": { server } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );

  res.json({ message: "🗑 Download server removed", movie });
};
