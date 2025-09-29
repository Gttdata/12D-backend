const express = require('express');
const router = express.Router();
const attendanceMasterService = require('../../Services/Masters/attendance');

router
.post('/get',attendanceMasterService.get)
.post('/create',attendanceMasterService.validate(),attendanceMasterService.create)
.put('/update',attendanceMasterService.validate(),attendanceMasterService.update)
.post('/markAttendance',attendanceMasterService.markAttendance)


module.exports = router;