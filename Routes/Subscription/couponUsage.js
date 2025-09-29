const express = require('express');
const router = express.Router();
const couponUsageService = require('../../Services/Subscription/couponUsage.js');

router
    .post('/get', couponUsageService.get)
    .post('/create', couponUsageService.validate(), couponUsageService.create)
    .put('/update', couponUsageService.validate(), couponUsageService.update)
    
    .post('/getCoupanUsageSummary', couponUsageService.getCoupanUsageSummary)

module.exports = router;