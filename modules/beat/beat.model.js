// models/beat.js
const mongoose = require("mongoose");

const beatSchema = new mongoose.Schema(
  {
    beatName: {
      type: String,
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bpm: {
      type: Number,
      required: true,
    },
    collaborators: {
      type: String,
    },
    containsSamples: {
      type: Boolean,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    isOnlyProducer: {
      type: Boolean,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    producerName: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    youtubeUrl: {
      type: String,
    },
    audioPath: {
      type: String,
    },
    register:{type : Boolean, default : false},
    registrasionId : {type : String},
    imagePath: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Beat", beatSchema);
