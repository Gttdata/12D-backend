const express = require('express');
const router = express.Router();
const subscriptionMasterService = require('../../Services/Masters/subscription');

router
    .post('/get', subscriptionMasterService.get)
    .post('/create', subscriptionMasterService.validate(), subscriptionMasterService.create)
    .put('/update', subscriptionMasterService.validate(), subscriptionMasterService.update)


module.exports = router;