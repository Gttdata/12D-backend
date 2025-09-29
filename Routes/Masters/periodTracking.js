const express = require('express');
const router = express.Router();
const periodTrackingService = require('../../Services/Masters/periodTracking.js');

router
    .post('/get', periodTrackingService.get)
    .post('/create', periodTrackingService.validate(), periodTrackingService.create)
    .put('/update', periodTrackingService.validate(), periodTrackingService.update)


module.exports = router;