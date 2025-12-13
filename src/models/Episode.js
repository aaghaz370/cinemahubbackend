const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      required: true
    },

    views: {
  type: Number,
  default: 0
},
    episodeNumber: { type: Number, required: true },
    title: String,

    watch: [
      {
        server: String,
        url: String
      }
    ],

    download: [
      {
        quality: String,
        links: [
          {
            server: String,
            url: String
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Episode", episodeSchema);
