const express = require('express');
const router = express.Router();
const activityHeadMasterService = require('../../Services/Masters/activityHead.js');

router
    .post('/get', activityHeadMasterService.get)
    .post('/create', activityHeadMasterService.validate(), activityHeadMasterService.create)
    .put('/update', activityHeadMasterService.validate(), activityHeadMasterService.update)
    .post('/addUserHead', activityHeadMasterService.addUserHead)
    .post('/updateUserHead', activityHeadMasterService.updateUserHead)
    .post('/getCustomWorkOutReports', activityHeadMasterService.getCustomWorkOutReports)
    .post('/getCustomWorkOutSummary', activityHeadMasterService.getCustomWorkOutSummary)


module.exports = router;