const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
  {
    tmdbId: Number,
    name: String,
    profile: String,
    role: String
  },
  { _id: false }
);

const seriesSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    tmdbId: Number,

    metadata: {
      poster: String,
      backdrop: String,
      overview: String,
      genres: [String],

      cast: [personSchema],
      director: personSchema,
      producer: [personSchema],

      rating: Number,
      language: String,
      originalTitle: String,
      countries: [String],
      companies: [String]
    },

    seasons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Season"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", seriesSchema);
