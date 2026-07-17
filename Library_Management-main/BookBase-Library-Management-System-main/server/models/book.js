const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    publisher: {
        type: String
    },
    status: {
        type: String,
        enum: ['available', 'issued', 'maintenance'],
        default: 'available'
    },
    placeLocated: {
        type: String
    },
    issuedTo: {
        type: String,
        default: null
    },
    issuedDate: {
        type: Date,
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    returnedDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);