const express = require("express");
const { create, getAllSupportRequests } = require("./support.controller");


const router = express.Router();

router.post('/create' , create)


router.get("/getAllSupportRequests", getAllSupportRequests);
module.exports = router;
