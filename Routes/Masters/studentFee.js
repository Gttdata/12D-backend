const express = require('express');
const router = express.Router();
const studentFeeMasterService = require('../../Services/Masters/studentFee.js');

router
    .post('/get', studentFeeMasterService.get)
    .post('/create', studentFeeMasterService.validate(), studentFeeMasterService.create)
    .put('/update', studentFeeMasterService.validate(), studentFeeMasterService.update)
    .post('/addBulk',  studentFeeMasterService.addBulk)
    .post('/sendFeeDuesNotification',  studentFeeMasterService.sendFeeDuesNotification)
    .post('/delete', studentFeeMasterService.delete)

module.exports = router;