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
      countries: [String],

      // ================= OTT PLATFORMS & VIDEOS =================
      // Watch Providers (OTT Platforms)
      watchProviders: {
        flatrate: [  // Subscription services (Netflix, Prime, etc.)
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        rent: [  // Rent options
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        buy: [  // Buy options
          {
            provider_name: String,
            logo_path: String,
            provider_id: Number
          }
        ],
        link: String  // TMDB watch providers page
      },

      // Videos (Trailers, Clips, BTS, etc.)
      videos: [
        {
          key: String,  // YouTube video ID
          name: String,  // Video title
          site: String,  // YouTube, Vimeo, etc.
          type: String,  // Trailer, Teaser, Clip, Behind the Scenes, Bloopers, Featurette
          official: Boolean,  // Official video or not
          size: Number  // Video resolution (720, 1080)
        }
      ]
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

// ==================== NETFLIX-STYLE BADGE SYSTEM ====================
// Virtual field: Calculate if movie should show "Recently added" badge
// Badge shows for 20 days after creation
movieSchema.virtual('badge').get(function () {
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  // If movie was created in last 20 days
  if (this.createdAt >= twentyDaysAgo) {
    return {
      show: true,
      type: 'recently-added',
      text: 'Recently added'
    };
  }

  return {
    show: false,
    type: null,
    text: null
  };
});

// Ensure virtual fields are included in JSON/Object conversion
movieSchema.set('toJSON', { virtuals: true });
movieSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Movie", movieSchema);


