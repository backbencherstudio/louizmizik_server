const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransectionSchema = new Schema(
  {
   credit: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userNAme : {type :String},
    userEmail : {type : String},
    customerId: {type: String},
    method: {
      type: String,
      enum: ["subscription", "extracredit"], 
      required: true, 
    },
    amount : {type:Number},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Transection", TransectionSchema);
