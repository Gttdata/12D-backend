const express = require('express');
const router = express.Router();
const classFeeMappingService = require('../../Services/Masters/classFeeMapping.js');

router
    .post('/get', classFeeMappingService.get)
    .post('/create', classFeeMappingService.validate(), classFeeMappingService.create)
    .put('/update', classFeeMappingService.validate(), classFeeMappingService.update)
    .post('/add', classFeeMappingService.add)


module.exports = router;