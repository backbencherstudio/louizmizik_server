const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  priceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  features: { type: [String] }, // Array of features
  price: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  interval: { type: String, enum: ['month', 'year'], required: true },
});

module.exports = mongoose.model('Plan', PlanSchema);
