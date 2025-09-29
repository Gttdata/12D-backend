const express = require('express');
const router = express.Router();
const teacherMasterService = require('../../Services/Masters/teacher');

router
    .post('/get', teacherMasterService.get)
    .post('/create', teacherMasterService.validate(), teacherMasterService.create)
    .put('/update', teacherMasterService.validate(), teacherMasterService.update)
    .post('/add', teacherMasterService.validate(), teacherMasterService.add)
    .post('/updateBulk', teacherMasterService.validate(), teacherMasterService.updateBulk)
    .post('/register', teacherMasterService.validate(), teacherMasterService.register)
    .post('/approveReject', teacherMasterService.validate(), teacherMasterService.approveReject)
    .post('/getCount',  teacherMasterService.getCount)
    .put('/updateUser', teacherMasterService.validate(), teacherMasterService.updateUser)


module.exports = router;