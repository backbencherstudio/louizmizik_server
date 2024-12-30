const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: [true, "name is required"] },
    email: { type: String, required: [true, "email is required and unique"], unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
