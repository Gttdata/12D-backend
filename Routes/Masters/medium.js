const express = require('express');
const router = express.Router();
const mediumMasterService = require('../../Services/Masters/medium.js');

router
    .post('/get', mediumMasterService.get)
    .post('/create', mediumMasterService.validate(), mediumMasterService.create)
    .put('/update', mediumMasterService.validate(), mediumMasterService.update)


module.exports = router;