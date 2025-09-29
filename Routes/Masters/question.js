const express = require('express');
const router = express.Router();
const questionMasterService = require('../../Services/Masters/question.js');

router
    .post('/get', questionMasterService.get)
    .post('/create', questionMasterService.validate(), questionMasterService.create)
    .put('/update', questionMasterService.validate(), questionMasterService.update)
    .post('/addBulk', questionMasterService.validate(), questionMasterService.addBulk)
    .post('/updateBulk', questionMasterService.validate(), questionMasterService.updateBulk)
    .post('/getChapterList', questionMasterService.getChapterList)


module.exports = router;