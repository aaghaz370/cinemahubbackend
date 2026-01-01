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
      companies: [String],

      // ================= OTT PLATFORMS & VIDEOS =================
      // Watch Providers (OTT Platforms)
      watchProviders: {
        flatrate: [  // Subscription services
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        rent: [
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        buy: [
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        link: String
      },

      // Videos (Trailers, Clips, etc.)
      videos: [
        {
          key: String,
          name: String,
          site: String,
          type: String,
          official: Boolean,
          size: Number
        }
      ]
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
