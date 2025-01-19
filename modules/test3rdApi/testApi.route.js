const express = require("express");

const router = express.Router();
const { testApi, AuthoRized } = require("./testApi.controller");

router.get("/testApi", testApi);
router.get("/Authorized", AuthoRized)
module.exports = router;
