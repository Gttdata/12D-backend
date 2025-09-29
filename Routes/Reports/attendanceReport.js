const express = require('express');
const router = express.Router();
const attendanceService = require('../../Services/Reports/attendanceReport.js');

router
    .post('/getSubjectwiseCount', attendanceService.getSubjectwiseCount)
    .post('/getClasswiseCount', attendanceService.getClasswiseCount)
    .post('/dateWisePresentCount', attendanceService.dateWisePresentCount)


module.exports = router;