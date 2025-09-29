const express = require('express');
const router = express.Router();
const questionaryOptionsService = require('../../Services/TrackBook/questionaryOptions.js');

router
    .post('/get', questionaryOptionsService.get)
    .post('/create', questionaryOptionsService.validate(), questionaryOptionsService.create)
    .put('/update', questionaryOptionsService.validate(), questionaryOptionsService.update)
    .post('/add', questionaryOptionsService.add)


module.exports = router;