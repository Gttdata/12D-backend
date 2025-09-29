const express = require('express');
const router = express.Router();
const taskMasterService = require('../../Services/TrackBook/task.js');

router
    .post('/get', taskMasterService.get)
    .post('/create', taskMasterService.validate(), taskMasterService.create)
    .put('/update', taskMasterService.validate(), taskMasterService.update)
    .post('/getUnmapped', taskMasterService.getUnmapped)


module.exports = router;