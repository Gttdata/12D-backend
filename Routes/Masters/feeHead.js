const express = require('express');
const router = express.Router();
const feeHeadMasterService = require('../../Services/Masters/feeHead.js');

router
    .post('/get', feeHeadMasterService.get)
    .post('/create', feeHeadMasterService.validate(), feeHeadMasterService.create)
    .put('/update', feeHeadMasterService.validate(), feeHeadMasterService.update)


module.exports = router;