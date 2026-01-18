const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema({
    tmdbId: {
        type: mongoose.Schema.Types.Mixed, // Can be Number or String
        unique: true,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    profile_path: String,
    biography: String,
    birthday: String,
    place_of_birth: String,
    popularity: Number,
    known_for_department: String,
    gender: Number, // 1 = female, 2 = male

    // Cached content IDs for performance
    movieIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    seriesIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Series' }],

    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
actorSchema.index({ name: 'text' });
actorSchema.index({ popularity: -1 });

module.exports = mongoose.model('Actor', actorSchema);
