const express = require('express');
const router = express.Router();
const boardMediumMasterService = require('../../Services/Masters/boardMedium.js');

router
    .post('/get', boardMediumMasterService.get)
    .post('/create', boardMediumMasterService.validate(), boardMediumMasterService.create)
    .put('/update', boardMediumMasterService.validate(), boardMediumMasterService.update)


module.exports = router;