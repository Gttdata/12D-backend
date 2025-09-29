const express = require('express');
const router = express.Router();
const studentClassMappingService = require('../../Services//Masters/studentClassMapping.js');

router
    .post('/get', studentClassMappingService.get)
    .post('/create', studentClassMappingService.validate(), studentClassMappingService.create)
    .put('/update', studentClassMappingService.validate(), studentClassMappingService.update)


module.exports = router;