const express = require('express');
const router = express.Router();
const userSubscriptionService = require('../../Services/Subscription/userSubscription.js');

router
    .post('/get', userSubscriptionService.get)
    .post('/create', userSubscriptionService.validate(), userSubscriptionService.create)
    .put('/update', userSubscriptionService.validate(), userSubscriptionService.update)
    .post('/add', userSubscriptionService.add)
    .post('/getUserSubscriptionSummary', userSubscriptionService.getUserSubscriptionSummary)
    .post('/exit', userSubscriptionService.exit)

module.exports = router;