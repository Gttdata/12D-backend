const express = require('express');
const router = express.Router();
const whatsAppMessageHistoryService = require('../../Services/Masters/whatsAppMessageHistory');

router
    .post('/get', whatsAppMessageHistoryService.get)
    .post('/create', whatsAppMessageHistoryService.validate(), whatsAppMessageHistoryService.create)
    .put('/update', whatsAppMessageHistoryService.validate(), whatsAppMessageHistoryService.update)


module.exports = router;