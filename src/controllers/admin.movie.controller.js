const Movie = require("../models/Movie");
const tmdb = require("../config/tmdb");
const slugify = require("slugify");

exports.addMovie = async (req, res) => {
  try {
    const { title, tmdbId, watch = [], download = [] } = req.body;

    console.log(`📥 Fetching TMDB data for: ${title} (ID: ${tmdbId})`);

    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
      params: { append_to_response: "credits" }
    });

    console.log('✅ TMDB data received');

    // 🎭 CAST - Safe handling
    const cast = data.credits?.cast?.slice(0, 10).map(p => ({
      name: p.name,
      profile: p.profile_path,
      tmdbId: p.id
    })) || [];

    // 🎬 DIRECTOR - Safe handling
    const directorData = data.credits?.crew?.find(
      c => c.job === "Director"
    );

    const director = directorData
      ? {
        name: directorData.name,
        profile: directorData.profile_path,
        tmdbId: directorData.id
      }
      : null;

    // 🏭 PRODUCERS - Safe handling
    const producers = data.credits?.crew
      ?.filter(c => c.job === "Producer")
      ?.slice(0, 5)
      ?.map(p => ({
        name: p.name,
        profile: p.profile_path,
        tmdbId: p.id
      })) || [];

    const movie = await Movie.create({
      title,
      slug: slugify(title, { lower: true }),
      tmdbId,

      metadata: {
        poster: data.poster_path,
        backdrop: data.backdrop_path,
        overview: data.overview,
        genres: data.genres?.map(g => g.name) || [],
        rating: data.vote_average || 0,
        language: data.original_language || 'en',
        runtime: data.runtime || 0,

        originalTitle: data.original_title || title,
        budget: data.budget || 0,
        revenue: data.revenue || 0,
        countries: data.production_countries?.map(c => c.name) || [],

        cast,
        director,
        producers
      },

      watch,
      download
    });

    console.log(`✅ Movie created: ${movie.title}`);
    res.status(201).json(movie);
  } catch (err) {
    console.error('❌ Error adding movie:', err.message);
    console.error('Stack:', err.stack);
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

/**
 * TOGGLE Theatre Status - Add/Remove from "Now in Theatres"
 */
exports.toggleTheatre = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Toggle the isInTheatre status
    movie.isInTheatre = !movie.isInTheatre;
    await movie.save();

    res.json({
      message: movie.isInTheatre ? "🎬 Added to Theatres" : "❌ Removed from Theatres",
      isInTheatre: movie.isInTheatre,
      movie
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
