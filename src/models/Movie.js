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
      rating: Number,
      logo: String, // New field for title logo

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
      countries: [String],

      // ================= OTT PLATFORMS & VIDEOS =================
      // Watch Providers (OTT Platforms)
      watchProviders: {
        flatrate: [  // Subscription services (Netflix, Prime, etc.)
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number,
            _id: false
          }
        ],
        rent: [  // Rent options
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number,
            _id: false
          }
        ],
        buy: [  // Buy options
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number,
            _id: false
          }
        ],
        link: String,  // TMDB watch providers page
        region: String  // Which region's data (IN, US, GB, etc.)
      },

      // Videos (Trailers, Clips, BTS, etc.)
      videos: [
        {
          key: String,  // YouTube video ID
          name: String,  // Video title
          site: String,  // YouTube, Vimeo, etc.)
          type: String,  // Trailer, Teaser, Clip, Behind the Scenes, Bloopers, Featurette
          official: Boolean,  // Official video or not
          size: Number,  // Video resolution (720, 1080)
          _id: false
        }
      ]
    },

    views: { type: Number, default: 0 },

    // Theatre Watch Feature - Movies currently in theatres
    isInTheatre: { type: Boolean, default: false },

    // Hero Banner Feature - Featured on homepage carousel (Max 8 items)
    isInHeroBanner: { type: Boolean, default: false },

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


