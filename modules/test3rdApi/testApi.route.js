const express = require("express");

const router = express.Router();
const { testApi } = require("./testApi.controller");

router.get("/testApi", testApi);
module.exports = router;
