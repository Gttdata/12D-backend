const express = require('express');
const router = express.Router();
const optionTaskMappingService = require('../../Services/TrackBook/optionTaskMapping.js');

router
    .post('/get', optionTaskMappingService.get)
    .post('/create', optionTaskMappingService.validate(), optionTaskMappingService.create)
    .put('/update', optionTaskMappingService.validate(), optionTaskMappingService.update)


module.exports = router;