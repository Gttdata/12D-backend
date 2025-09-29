const express = require('express');
const router = express.Router();
const holidayMasterService = require('../../Services/Masters/holiday.js');

router
    .post('/get', holidayMasterService.get)
    .post('/create', holidayMasterService.validate(), holidayMasterService.create)
    .put('/update', holidayMasterService.validate(), holidayMasterService.update)


module.exports = router;