const express = require('express');
const router = express.Router();
const questionTypeService = require('../../Services/Masters/questionType.js');

router
    .post('/get', questionTypeService.get)
    .post('/create', questionTypeService.validate(), questionTypeService.create)
    .put('/update', questionTypeService.validate(), questionTypeService.update)


module.exports = router;