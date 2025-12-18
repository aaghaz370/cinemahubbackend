const Episode = require("../models/Episode");
const Season = require("../models/Season");

/* ================= EPISODE WATCH ================= */
exports.addWatchServer = async (req, res) => {
  const { server, url } = req.body;
  const episode = await Episode.findByIdAndUpdate(
    req.params.episodeId,
    { $push: { watch: { server, url } } },
    { new: true }
  );
  res.json({ message: "✅ Watch server added", episode });
};

exports.updateWatchServer = async (req, res) => {
  const { oldServer, server, url } = req.body;
  const episode = await Episode.findOneAndUpdate(
    { _id: req.params.episodeId, "watch.server": oldServer },
    {
      $set: {
        "watch.$.server": server,
        "watch.$.url": url
      }
    },
    { new: true }
  );
  res.json({ message: "✏️ Watch server updated", episode });
};

exports.deleteWatchServer = async (req, res) => {
  const { server } = req.body;
  const episode = await Episode.findByIdAndUpdate(
    req.params.episodeId,
    { $pull: { watch: { server } } },
    { new: true }
  );
  res.json({ message: "🗑 Watch server removed", episode });
};

/* ================= EPISODE DOWNLOAD ================= */
exports.addDownloadQuality = async (req, res) => {
  const { quality } = req.body;
  const episode = await Episode.findByIdAndUpdate(
    req.params.episodeId,
    { $push: { download: { quality, links: [] } } },
    { new: true }
  );
  res.json({ message: "✅ Quality added", episode });
};

exports.deleteDownloadQuality = async (req, res) => {
  const { quality } = req.body;
  const episode = await Episode.findByIdAndUpdate(
    req.params.episodeId,
    { $pull: { download: { quality } } },
    { new: true }
  );
  res.json({ message: "🗑 Quality removed", episode });
};

exports.addDownloadServer = async (req, res) => {
  const { quality, server, url } = req.body;
  const episode = await Episode.findOneAndUpdate(
    { _id: req.params.episodeId },
    { $push: { "download.$[q].links": { server, url } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );
  res.json({ message: "✅ Download server added", episode });
};

exports.updateDownloadServer = async (req, res) => {
  const { quality, oldServer, server, url } = req.body;
  const episode = await Episode.findOneAndUpdate(
    { _id: req.params.episodeId },
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
  res.json({ message: "✏️ Download server updated", episode });
};

exports.deleteDownloadServer = async (req, res) => {
  const { quality, server } = req.body;
  const episode = await Episode.findOneAndUpdate(
    { _id: req.params.episodeId },
    { $pull: { "download.$[q].links": { server } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );
  res.json({ message: "🗑 Download server removed", episode });
};

/* ================= SEASON DOWNLOAD ================= */
exports.addSeasonDownloadQuality = async (req, res) => {
  const { quality } = req.body;
  const season = await Season.findByIdAndUpdate(
    req.params.seasonId,
    { $push: { download: { quality, links: [] } } },
    { new: true }
  );
  res.json({ message: "✅ Season quality added", season });
};

exports.deleteSeasonDownloadQuality = async (req, res) => {
  const { quality } = req.body;
  const season = await Season.findByIdAndUpdate(
    req.params.seasonId,
    { $pull: { download: { quality } } },
    { new: true }
  );
  res.json({ message: "🗑 Season quality removed", season });
};

exports.addSeasonDownloadServer = async (req, res) => {
  const { quality, server, url } = req.body;
  const season = await Season.findOneAndUpdate(
    { _id: req.params.seasonId },
    { $push: { "download.$[q].links": { server, url } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );
  res.json({ message: "✅ Season download server added", season });
};

exports.updateSeasonDownloadServer = async (req, res) => {
  const { quality, oldServer, server, url } = req.body;
  const season = await Season.findOneAndUpdate(
    { _id: req.params.seasonId },
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
  res.json({ message: "✏️ Season server updated", season });
};

exports.deleteSeasonDownloadServer = async (req, res) => {
  const { quality, server } = req.body;
  const season = await Season.findOneAndUpdate(
    { _id: req.params.seasonId },
    { $pull: { "download.$[q].links": { server } } },
    {
      arrayFilters: [{ "q.quality": quality }],
      new: true
    }
  );
  res.json({ message: "🗑 Season server removed", season });
};
