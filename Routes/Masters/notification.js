const express = require('express');
const router = express.Router();
const notificationMasterService = require('../../Services/Masters/notification');

router
    .post('/get', notificationMasterService.get)
    .post('/create', notificationMasterService.validate(), notificationMasterService.create)
    .put('/update', notificationMasterService.validate(), notificationMasterService.update)


module.exports = router;