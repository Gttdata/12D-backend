const express = require('express');
const router = express.Router();
const schoolMasterService = require('../../Services/Masters/school');

router
    .post('/get', schoolMasterService.get)
    .post('/getCount', schoolMasterService.getCount)
    .post('/create', schoolMasterService.validate(), schoolMasterService.create)
    .put('/update', schoolMasterService.validate(), schoolMasterService.update)
    .post('/add', schoolMasterService.validate(), schoolMasterService.add)
    .post('/updateSchool', schoolMasterService.validate(), schoolMasterService.updateSchool)
    .post('/approveReject', schoolMasterService.approveReject)
    .post('/updateStep', schoolMasterService.updateStep)


module.exports = router;