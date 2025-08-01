// backend/models/item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    category: { type: String, required: true },
    donorName: { type: String, required: true },
    location: { type: String, required: true },
    contactInfo: { type: String, required: true },
    status: { type: String, enum: ['available', 'requested', 'delivered'], default: 'available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema); 