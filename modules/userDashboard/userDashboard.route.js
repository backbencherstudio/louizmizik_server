const express = require("express");
const { userdasboard } = require("./userDashboard.controller");
const router = express.Router();

router.get("/user-dashboard", userdasboard);
module.exports = router;
