
const express = require('express');
const router = express.Router();

const { extraCredit, getSuccess } = require('./creditpayment.controller');
const User = require("../users/users.models");

router.post('/purchase-credits/:userId', extraCredit);



module.exports = router;
