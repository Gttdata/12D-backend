const express = require('express');
const router = express.Router();
const couponMasterService = require('../../Services/Subscription/coupon.js');

router
    .post('/get', couponMasterService.get)
    .post('/create', couponMasterService.validate(), couponMasterService.create)
    .put('/update', couponMasterService.validate(), couponMasterService.update)


module.exports = router;