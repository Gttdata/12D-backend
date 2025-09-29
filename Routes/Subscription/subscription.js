const express = require('express');
const router = express.Router();
const subscriptionMasterService = require('../../Services/Subscription/subscription.js');

router
    .post('/get', subscriptionMasterService.get)
    .post('/create', subscriptionMasterService.validate(), subscriptionMasterService.create)
    .put('/update', subscriptionMasterService.validate(), subscriptionMasterService.update)
    .post('/generateOrderId', subscriptionMasterService.generateOrderId)
    .post('/sendSubscriptionMessage', subscriptionMasterService.sendSubscriptionMessage)


module.exports = router;