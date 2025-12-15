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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Season", seasonSchema);
