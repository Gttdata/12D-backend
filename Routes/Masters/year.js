const express = require('express');
const router = express.Router();
const yearMasterService = require('../../Services/Masters/year.js');

router
    .post('/get', yearMasterService.get)
    .post('/create', yearMasterService.validate(), yearMasterService.create)
    .put('/update', yearMasterService.validate(), yearMasterService.update)


module.exports = router;