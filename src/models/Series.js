const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tmdbId: { type: Number, required: true, unique: true },

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


seriesSchema.index({ title: "text" });
seriesSchema.index({ slug: 1 });

module.exports = mongoose.model("Series", seriesSchema);
