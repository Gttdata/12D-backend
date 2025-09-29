const express = require('express');
const router = express.Router();
const questionaryMasterService = require('../../Services/TrackBook/questionary.js');

router
    .post('/get', questionaryMasterService.get)
    .post('/create', questionaryMasterService.validate(), questionaryMasterService.create)
    .put('/update', questionaryMasterService.validate(), questionaryMasterService.update)
    .post('/add', questionaryMasterService.validate(), questionaryMasterService.add)
    .post('/getData', questionaryMasterService.getData)


module.exports = router;