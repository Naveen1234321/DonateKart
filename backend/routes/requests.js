const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const Request = require('../models/request');

// POST /api/request/:id - Request an item
router.post('/request/:id', async (req, res) => {
    try {
        const { requestorName, requestorContact } = req.body;
        if (!requestorName || !requestorContact) {
            return res.status(400).json({ error: 'Please provide your name and contact info.' });
        }
        
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            // Find the item
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            if (item.status !== 'available') {
                return res.status(400).json({ error: 'Item is not available for request' });
            }
            // Create the request
            const newRequest = new Request({
                item: item._id,
                requestorName,
                requestorContact
            });
            await newRequest.save();
            // Update item status
            item.status = 'requested';
            await item.save();
            res.status(201).json({ message: 'Item requested successfully', request: newRequest });
        } else {
            // Find the item
            const item = await inMemoryStorage.findItemById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            if (item.status !== 'available') {
                return res.status(400).json({ error: 'Item is not available for request' });
            }
            // Create the request
            const newRequest = await inMemoryStorage.createRequest({
                item: req.params.id,
                requestorName,
                requestorContact
            });
            // Update item status
            await inMemoryStorage.updateItemStatus(req.params.id, 'requested');
            res.status(201).json({ message: 'Item requested successfully', request: newRequest });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to request item', details: error.message });
    }
});

// GET /api/my-requests/:requestorName - Get all requests made by a requestor
router.get('/my-requests/:requestorName', async (req, res) => {
    try {
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const requests = await Request.find({ requestorName: req.params.requestorName })
                .populate('item')
                .sort({ createdAt: -1 });
            res.json(requests);
        } else {
            const requests = await inMemoryStorage.findRequestsByRequestor(req.params.requestorName);
            res.json(requests);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests', details: error.message });
    }
});

module.exports = router; 