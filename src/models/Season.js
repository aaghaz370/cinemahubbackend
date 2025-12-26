const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema(
  {
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true
    },
    seasonNumber: { type: Number, required: true },

    episodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Episode"
      }
    ],

    // ZIP Downloads for entire season
    zipDownloads: [
      {
        quality: { type: String, required: true }, // e.g., "720p", "1080p"
        url: { type: String, required: true },
        server: { type: String, default: "HubCloud" }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Season", seasonSchema);
