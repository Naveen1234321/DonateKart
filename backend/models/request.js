// backend/models/request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    requestorName: { type: String, required: true },
    requestorContact: { type: String, required: true },
    status: { type: String, enum: ['requested', 'approved', 'delivered'], default: 'requested' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema); 