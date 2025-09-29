const express = require('express');
const router = express.Router();
const attendanceDetailsService = require('../../Services/Masters/attendanceDetails');

router
    .post('/get', attendanceDetailsService.get)
    .post('/create', attendanceDetailsService.validate(), attendanceDetailsService.create)
    .put('/update', attendanceDetailsService.validate(), attendanceDetailsService.update)
    .post('/getCount', attendanceDetailsService.getCount)
    .post('/getSubjectCount', attendanceDetailsService.getSubjectCount)

module.exports = router;