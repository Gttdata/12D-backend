const express = require('express');
const router = express.Router();
const emailMessageHistoryService = require('../../Services/Masters/emailMessageHistory.js');

router
    .post('/get', emailMessageHistoryService.get)
    .post('/create', emailMessageHistoryService.validate(), emailMessageHistoryService.create)
    .put('/update', emailMessageHistoryService.validate(), emailMessageHistoryService.update)


module.exports = router;