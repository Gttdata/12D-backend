const express = require('express');
const router = express.Router();
const userAppLogsService = require('../../Services/Masters/userAppLogs.js');

router
    .post('/get', userAppLogsService.get)
    .post('/create', userAppLogsService.validate(), userAppLogsService.create)
    .put('/update', userAppLogsService.validate(), userAppLogsService.update)


module.exports = router;