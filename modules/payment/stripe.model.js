const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
