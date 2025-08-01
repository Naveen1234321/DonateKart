const express = require('express');
const router = express.Router();
const Item = require('../models/item');

// POST /api/donate - Add new donation item
router.post('/donate', async (req, res) => {
    try {
        const { name, description, imageUrl, category, donorName, location, contactInfo } = req.body;
        // Basic validation
        if (!name || !description || !category || !donorName || !location || !contactInfo) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }
        
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const newItem = new Item({
                name,
                description,
                imageUrl,
                category,
                donorName,
                location,
                contactInfo
            });
            const savedItem = await newItem.save();
            res.status(201).json({ message: 'Donation item added successfully', item: savedItem });
        } else {
            const savedItem = await inMemoryStorage.createItem({
                name,
                description,
                imageUrl,
                category,
                donorName,
                location,
                contactInfo
            });
            res.status(201).json({ message: 'Donation item added successfully', item: savedItem });
        }
    } catch (error) {
        console.error('Error adding donation item:', error);
        res.status(500).json({ error: 'Failed to add donation item', details: error.message });
    }
});

// GET /api/items - Get all donation items
router.get('/items', async (req, res) => {
    try {
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const items = await Item.find().sort({ createdAt: -1 });
            res.json(items);
        } else {
            const items = await inMemoryStorage.findItems();
            res.json(items);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch items', details: error.message });
    }
});

// GET /api/items/:id - Get a single donation item by ID
router.get('/items/:id', async (req, res) => {
    try {
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            res.json(item);
        } else {
            const item = await inMemoryStorage.findItemById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            res.json(item);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch item', details: error.message });
    }
});

// GET /api/my-donations/:donorName - Get all items posted by a donor
router.get('/my-donations/:donorName', async (req, res) => {
    try {
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const items = await Item.find({ donorName: req.params.donorName }).sort({ createdAt: -1 });
            res.json(items);
        } else {
            const items = await inMemoryStorage.findItemsByDonor(req.params.donorName);
            res.json(items);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donor items', details: error.message });
    }
});

// POST /api/items/:id/deliver - Mark item as delivered
router.post('/items/:id/deliver', async (req, res) => {
    try {
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            if (item.status === 'delivered') {
                return res.status(400).json({ error: 'Item already delivered' });
            }
            item.status = 'delivered';
            await item.save();
            // Update related request status if exists
            const Request = require('../models/request');
            await Request.updateMany({ item: item._id, status: { $ne: 'delivered' } }, { status: 'delivered' });
            res.json({ message: 'Item marked as delivered', item });
        } else {
            const item = await inMemoryStorage.findItemById(req.params.id);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
            if (item.status === 'delivered') {
                return res.status(400).json({ error: 'Item already delivered' });
            }
            const updatedItem = await inMemoryStorage.updateItemStatus(req.params.id, 'delivered');
            await inMemoryStorage.updateRequestStatus(req.params.id, 'delivered');
            res.json({ message: 'Item marked as delivered', item: updatedItem });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark as delivered', details: error.message });
    }
});

module.exports = router; 