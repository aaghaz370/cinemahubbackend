const mongoose = require("mongoose");

const continueSchema = new mongoose.Schema(
  {
    userId: String, // future auth ke liye
    contentType: String, // movie | episode
    contentId: mongoose.Schema.Types.ObjectId,
    progress: Number // seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContinueWatching", continueSchema);
