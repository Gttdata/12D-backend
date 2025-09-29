const express = require('express');
const router = express.Router();
const boardMasterService = require('../../Services/Masters/board.js');

router
    .post('/get', boardMasterService.get)
    .post('/create', boardMasterService.validate(), boardMasterService.create)
    .put('/update', boardMasterService.validate(), boardMasterService.update)


module.exports = router;