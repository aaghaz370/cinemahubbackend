const Movie = require("../models/Movie");
const tmdb = require("../config/tmdb");
const slugify = require("slugify");
const { fetchMovieExtras } = require('../helpers/tmdb.helper');
const { syncActorsFromMovie } = require('../helpers/actor.sync.helper');

exports.addMovie = async (req, res) => {
  try {
    const { title, tmdbId, watch = [], download = [] } = req.body;

    console.log(`📥 Fetching TMDB data for: ${title} (ID: ${tmdbId})`);

    const { data } = await tmdb.get(`/movie/${tmdbId}`, {
      params: { append_to_response: "credits,images", include_image_language: "en,null" }
    });

    console.log('✅ TMDB data received');

    // 🖼️ LOGO - Get 1st English PNG logo
    const logo = data.images?.logos?.find(l => l.file_path?.endsWith('.png'))?.file_path || null;

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
        logo: logo, // Save the logo here
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

    // 🎬 FETCH WATCH PROVIDERS & VIDEOS (Async - don't block response)
    fetchMovieExtras(tmdbId).then(({ watchProviders, videos }) => {
      if (watchProviders || videos?.length > 0) {
        if (watchProviders) {
          movie.metadata.watchProviders = watchProviders;
          movie.markModified('metadata.watchProviders');
        }
        if (videos?.length > 0) {
          movie.metadata.videos = videos;
          movie.markModified('metadata.videos');
        }
        movie.save().then(() => {
          console.log(`✅ Watch Providers & Videos updated for: ${movie.title}`);
        }).catch(err => {
          console.error(`Failed to save providers for ${movie.title}:`, err.message);
        });
      }
    }).catch(err => {
      console.error(`Failed to fetch extras for ${movie.title}:`, err.message);
    });

    // 🎭 SYNC ACTORS (Async - don't block response)
    syncActorsFromMovie(movie).catch(err => {
      console.error(`Failed to sync actors for ${movie.title}:`, err.message);
    });

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

/**
 * TOGGLE Hero Banner Status - Add/Remove from Homepage Hero Banner (Max 8 items)
 */
exports.toggleHeroBanner = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check current count if trying to enable
    if (!movie.isInHeroBanner) {
      const currentCount = await Movie.countDocuments({ isInHeroBanner: true });
      const Series = require('../models/Series');
      const seriesCount = await Series.countDocuments({ isInHeroBanner: true });

      if (currentCount + seriesCount >= 8) {
        return res.status(400).json({
          message: "❌ Hero Banner limit reached (8 items max). Remove an existing item first.",
          currentCount: currentCount + seriesCount
        });
      }
    }

    // Toggle the isInHeroBanner status
    movie.isInHeroBanner = !movie.isInHeroBanner;
    await movie.save();

    res.json({
      message: movie.isInHeroBanner ? "⭐ Added to Hero Banner" : "❌ Removed from Hero Banner",
      isInHeroBanner: movie.isInHeroBanner,
      movie
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
