const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
    workingHours: {
        start: { type: String, required: true },
        end: { type: String, required: true }
    }
});

module.exports = {
    Holiday: mongoose.model('Holiday', holidaySchema),
    Settings: mongoose.model('Settings', settingsSchema)
};