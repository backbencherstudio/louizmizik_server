const express = require("express");
const { adminDashboard, addUserBlacklist, allUserDetails, getUserRegistrationsByTimeframe, revenueDashboard, AllTransections, searchBeats, getRevenueAndCredit, searchUserBeats } = require("./adminDashboard.controllar");


const router = express.Router();


router.get("/adminDashboard", adminDashboard);
router.get("/revenueDashboard", revenueDashboard)
// here will be add varify Admin
router.delete("/user-blacklist/:userId" , addUserBlacklist)

router.get("/allUserDetails", allUserDetails)
router.get("/user-registrations", getUserRegistrationsByTimeframe)
router.get("/AllTransections", AllTransections)
router.get("/search", searchBeats)
router.get("/search/:userId", searchUserBeats)
router.get("/revenueChart", getRevenueAndCredit )
module.exports = router;
