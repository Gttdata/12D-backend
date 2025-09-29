const express = require('express');
const router = express.Router();
const advertisementMasterService = require('../../Services/Masters/advertisement');

router
    .post('/get', advertisementMasterService.get)
    .post('/create', advertisementMasterService.validate(), advertisementMasterService.create)
    .put('/update', advertisementMasterService.validate(), advertisementMasterService.update)


module.exports = router;