const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    tmdbId: { type: Number, required: true, unique: true },
    
const personSchema = new mongoose.Schema(
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
  runtime: Number,

  originalTitle: String,
  budget: Number,
  revenue: Number,
  countries: [String],
  companies: [String]
},


    views: {
  type: Number,
  default: 0
},
   

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
