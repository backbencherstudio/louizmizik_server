const express = require("express");
const { createBeat, OneUsergetBeats,deleteBeat, lala } = require("./beat.controller");
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
router.delete("/deleteBeat/:id", verifyUser, deleteBeat)

router.get("/test", lala)
module.exports = router;
