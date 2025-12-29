const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tmdbId: { type: Number, required: true, unique: true },

    metadata: {
      poster: String,
      backdrop: String,
      overview: String,
      genres: [String],

      // ✅ SIMPLE & SAFE
      cast: [
        {
          name: String,
          profile: String,
          tmdbId: Number
        }
      ],

      director: {
        name: String,
        profile: String,
        tmdbId: Number
      },

      producers: [
        {
          name: String,
          profile: String,
          tmdbId: Number
        }
      ],

      rating: Number,
      language: String,
      runtime: Number,

      // NEW FIELDS
      originalTitle: String,
      budget: Number,
      revenue: Number,
      countries: [String]
    },

    views: { type: Number, default: 0 },

    // Theatre Watch Feature - Movies currently in theatres
    isInTheatre: { type: Boolean, default: false },

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

movieSchema.index({ title: "text" });
movieSchema.index({ slug: 1 });

module.exports = mongoose.model("Movie", movieSchema);


