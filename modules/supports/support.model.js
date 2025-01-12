// models/SupportRequest.js
const mongoose = require('mongoose');


const supportRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    issue: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
