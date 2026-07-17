const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    facultyId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['Library', 'Infrastructure', 'Technical', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Resolved'],
        default: 'Pending'
    },
    adminResponse: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);