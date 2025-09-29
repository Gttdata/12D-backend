const express = require('express');
const router = express.Router();
const userSubscriptionDetailsService = require('../../Services/Subscription/userSubscriptionDetails.js');

router
    .post('/get', userSubscriptionDetailsService.get)
    .post('/create', userSubscriptionDetailsService.validate(), userSubscriptionDetailsService.create)
    .put('/update', userSubscriptionDetailsService.validate(), userSubscriptionDetailsService.update)


module.exports = router;