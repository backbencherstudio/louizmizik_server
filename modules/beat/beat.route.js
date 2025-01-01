const express = require('express');
const { createBeat } = require('./beat.controller');
const upload = require('../../middleware/multerConfig');


const router = express.Router();


router.post(
    '/create-beat',
    upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]),
    createBeat
  );
module.exports = router;