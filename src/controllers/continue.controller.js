const Continue = require("../models/ContinueWatching");

exports.saveProgress = async (req, res) => {
  const { userId, contentType, contentId, progress } = req.body;

  await Continue.findOneAndUpdate(
    { userId, contentType, contentId },
    { progress },
    { upsert: true }
  );

  res.json({ saved: true });
};

exports.getContinueWatching = async (req, res) => {
  const list = await Continue.find({ userId: req.params.userId })
    .sort({ updatedAt: -1 })
    .limit(10);

  res.json(list);
};
