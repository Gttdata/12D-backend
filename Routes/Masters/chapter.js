const express = require('express');
const router = express.Router();
const chapterMasterService = require('../../Services/Masters/chapter.js');

router
    .post('/get', chapterMasterService.get)
    .post('/create', chapterMasterService.validate(), chapterMasterService.create)
    .put('/update', chapterMasterService.validate(), chapterMasterService.update)


module.exports = router;