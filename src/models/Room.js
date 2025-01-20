const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['clean', 'dirty'], default: 'dirty' },
    lastCleanedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Room', roomSchema);
