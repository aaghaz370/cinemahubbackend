const Movie = require("../models/Movie");
const tmdb = require("../config/tmdb");
const slugify = require("slugify");

exports.addMovie = async (req, res) => {
  try {
    const { title, tmdbId, watch, download } = req.body;

    if (!title || !tmdbId) {
      return res.status(400).json({ message: "Title & TMDB ID required" });
    }

    // Fetch TMDB Data
    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
  params: { append_to_response: "credits,recommendations" }
});


    const movie = await Movie.create({
  title,
  slug: slugify(title, { lower: true }),
  tmdbId,

  metadata: {
    poster: data.poster_path,
    backdrop: data.backdrop_path,
    overview: data.overview,
    genres: data.genres.map(g => g.name),

    cast,
    director: director
      ? {
          tmdbId: director.id,
          name: director.name,
          profile: director.profile_path,
          role: "Director"
        }
      : null,

    producer: producers,

    rating: data.vote_average,
    language: data.original_language,
    runtime: data.runtime,

    originalTitle: data.original_title,
    budget: data.budget,
    revenue: data.revenue,
    countries: data.production_countries?.map(c => c.name),
    companies: data.production_companies?.map(c => c.name)
  },

  watch: watch || [],
  download: download || []
});


    res.status(201).json({
      message: "🎬 Movie added successfully",
      movie
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * UPDATE movie (watch / download / title)
 */
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({
      message: "✅ Movie updated",
      movie
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE movie
 */
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "🗑 Movie deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
