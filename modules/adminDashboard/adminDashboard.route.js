const express = require("express");
const { adminDashboard, addUserBlacklist } = require("./adminDashboard.controllar");


const router = express.Router();


router.get("/adminDashboard", adminDashboard);
// here will be add varify Admin
router.delete("user-blacklist/:userId" , addUserBlacklist)
module.exports = router;
