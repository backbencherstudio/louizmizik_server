const express = require("express");
const { createBeat, OneUsergetBeats,deleteBeat, lala, oneBeatDetails } = require("./beat.controller");
const upload = require("../../middleware/multerConfig");
const { verifyUser } = require("../../middleware/verifyUser");

const router = express.Router();

router.post(
  "/create-beat/:userId",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  
  createBeat
);

router.get("/get-beats/:userId", verifyUser, OneUsergetBeats);
router.get("/oneBeatDetails/:id", verifyUser, oneBeatDetails)
router.delete("/deleteBeat/:id", deleteBeat) ///// varify admin will do

router.get("/test", lala)
module.exports = router;
