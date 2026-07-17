const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal'
    },
    expiresIn: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for expiration and auto-deletion
broadcastSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Broadcast', broadcastSchema);