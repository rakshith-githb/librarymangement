const express = require('express');
const router = express.Router();
const Broadcast = require('../models/Broadcast');

// Get all active broadcasts
router.get('/broadcasts', async (req, res) => {
    try {
        const broadcasts = await Broadcast.find({
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        res.json(broadcasts);
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({ message: 'Error fetching broadcasts' });
    }
});

// Update the GET broadcasts endpoint to filter out older broadcasts for the dashboard view
router.get('/broadcasts/dashboard', async (req, res) => {
    try {
        // For dashboard, only show broadcasts less than 24 hours old
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const broadcasts = await Broadcast.find({
            expiresAt: { $gt: new Date() },
            createdAt: { $gt: oneDayAgo }  // Only messages created in the last 24 hours
        }).sort({ createdAt: -1 });
        
        res.json(broadcasts);
    } catch (error) {
        console.error('Error fetching broadcasts:', error);
        res.status(500).json({ message: 'Error fetching broadcasts' });
    }
});

router.post('/broadcast', async (req, res) => {
    try {
        const { title, content, priority, expiresIn } = req.body;
        const broadcast = new Broadcast({
            title,
            content,
            priority: priority || 'normal',
            expiresIn,
            expiresAt: new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000)
        });
        await broadcast.save();
        res.status(201).json(broadcast);
    } catch (error) {
        console.error('Error creating broadcast:', error);
        res.status(500).json({ message: 'Error creating broadcast' });
    }
});

module.exports = router;