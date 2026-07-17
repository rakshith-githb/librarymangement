const mongoose = require('mongoose');

const forumReplySchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumPost',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    taggedFaculty: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }],
    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForumReply'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ForumReply', forumReplySchema);