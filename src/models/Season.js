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

    // ZIP Downloads for entire season (Old field for backward compatibility)
    zipDownloads: [
      {
        quality: { type: String, required: true }, // e.g., "720p", "1080p"
        url: { type: String, required: true },
        server: { type: String, default: "HubCloud" }
      }
    ],

    // Download field for admin panel (matches Episode structure)
    download: [
      {
        quality: { type: String, required: true },
        links: [
          {
            server: { type: String, required: true },
            url: { type: String, required: true }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Season", seasonSchema);
