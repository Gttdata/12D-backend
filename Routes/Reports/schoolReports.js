const express = require('express');
const router = express.Router();
const schoolReportsService = require('../../Services/Reports/schoolReports.js');

router
    .post('/studentWiseTaskDetails', schoolReportsService.studentWiseTaskDetails)
    .post('/schoolWiseTaskCount', schoolReportsService.schoolWiseTaskCount)
    .post('/schoolWiseMemberCount', schoolReportsService.schoolWiseMemberCount)

module.exports = router;