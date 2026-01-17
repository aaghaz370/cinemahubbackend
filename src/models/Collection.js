const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    poster: {
        type: String, // TMDB poster path or custom image URL
        default: ''
    },
    backdrop: {
        type: String, // TMDB backdrop path
        default: ''
    },
    items: [{
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'items.contentType'
        },
        contentType: {
            type: String,
            enum: ['Movie', 'Series'],
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    order: {
        type: Number,
        default: 0 // For sorting collections on frontend
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        totalItems: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
collectionSchema.index({ slug: 1 });
collectionSchema.index({ isActive: 1, order: 1 });

// Update metadata before saving
collectionSchema.pre('save', function (next) {
    this.metadata.totalItems = this.items.length;
    this.metadata.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model('Collection', collectionSchema);
