const express = require('express');
const router = express.Router();
const studentMasterService = require('../../Services/Masters/student.js');

router
    .post('/get', studentMasterService.get)
    .post('/create', studentMasterService.validate(), studentMasterService.create)
    .put('/update', studentMasterService.validate(), studentMasterService.update)
    .post('/importData', studentMasterService.importData)
    .post('/promote', studentMasterService.promote)
    .post('/createStudents', studentMasterService.createStudents)
    .post('/mapClass', studentMasterService.mapClass)
    .post('/getCount', studentMasterService.getCount)
    .post('/approveReject', studentMasterService.approveReject)
    .post('/register', studentMasterService.register)


module.exports = router;