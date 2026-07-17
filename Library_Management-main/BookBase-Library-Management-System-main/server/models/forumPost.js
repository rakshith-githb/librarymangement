const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Events', 'Tech', 'Resources', 'Queries']
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for search functionality
forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('ForumPost', forumPostSchema);