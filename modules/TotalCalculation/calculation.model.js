const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransectionSchema = new Schema(
  {
   credit: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerId: {type: String}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transection", TransectionSchema);
