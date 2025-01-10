const express = require("express");
const { adminDashboard, addUserBlacklist, allUserDetails, getUserRegistrationsByTimeframe, revenueDashboard, AllTransections } = require("./adminDashboard.controllar");
const { verifyUser } = require("../../middleware/verifyUser");


const router = express.Router();


router.get("/adminDashboard", adminDashboard);
router.get("/revenueDashboard", revenueDashboard)
// here will be add varify Admin
router.delete("user-blacklist/:userId" , verifyUser, addUserBlacklist)

router.get("/allUserDetails", allUserDetails)
router.get("/users", getUserRegistrationsByTimeframe)
router.get("/AllTransections", AllTransections)
module.exports = router;
