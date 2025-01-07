const express = require("express");
const { adminDashboard, addUserBlacklist, allUserDetails, getUserRegistrationsByTimeframe } = require("./adminDashboard.controllar");


const router = express.Router();


router.get("/adminDashboard", adminDashboard);
// here will be add varify Admin
router.delete("user-blacklist/:userId" , addUserBlacklist)

router.get("/allUserDetails", allUserDetails)
router.get("/user-registrations", getUserRegistrationsByTimeframe)
module.exports = router;
