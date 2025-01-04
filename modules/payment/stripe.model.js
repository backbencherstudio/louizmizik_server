const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  customerId: { type: String, default: null },
  subscriptionId: { type: String, required: true },
  status: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
