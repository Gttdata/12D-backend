const express = require('express');
const router = express.Router();
const questionOptionsMappingService = require('../../Services/Masters/questionOptionsMapping.js');

router
    .post('/get', questionOptionsMappingService.get)
    .post('/create', questionOptionsMappingService.validate(), questionOptionsMappingService.create)
    .put('/update', questionOptionsMappingService.validate(), questionOptionsMappingService.update)


module.exports = router;