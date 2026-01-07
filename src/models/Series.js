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

// ==================== NETFLIX-STYLE BADGE SYSTEM ====================
// Series badges are more complex - need to check seasons + episodes
// This will be populated when seasons are loaded
// For now, basic check - badge will be enhanced when seasons are populated
seriesSchema.virtual('badge').get(function () {
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  // Priority 1: Check if series itself is new (last 20 days)
  if (this.createdAt >= twentyDaysAgo) {
    return {
      show: true,
      type: 'recently-added',
      text: 'Recently added'
    };
  }

  // Priority 2 & 3: Check seasons/episodes
  // This requires populated data - handled in controller
  if (this._latestSeasonDate && this._latestSeasonDate >= twentyDaysAgo) {
    return {
      show: true,
      type: 'new-season',
      text: 'New season added'
    };
  }

  if (this._latestEpisodeDate && this._latestEpisodeDate >= twentyDaysAgo) {
    return {
      show: true,
      type: 'new-episode',
      text: 'New episode | Watch now'
    };
  }

  return {
    show: false,
    type: null,
    text: null
  };
});

// Ensure virtual fields are included in JSON/Object conversion
seriesSchema.set('toJSON', { virtuals: true });
seriesSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Series", seriesSchema);
