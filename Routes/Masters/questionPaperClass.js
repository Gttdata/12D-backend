const express = require('express');
const router = express.Router();
const questionPaperClassService = require('../../Services/Masters/questionPaperClass.js');

router
    .post('/get', questionPaperClassService.get)
    .post('/create', questionPaperClassService.validate(), questionPaperClassService.create)
    .put('/update', questionPaperClassService.validate(), questionPaperClassService.update)


module.exports = router;