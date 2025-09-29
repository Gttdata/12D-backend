const express = require('express');
const router = express.Router();
const activityHeadMappingService = require('../../Services/Masters/activityHeadMapping.js');

router
    .post('/get', activityHeadMappingService.get)
    .post('/create', activityHeadMappingService.validate(), activityHeadMappingService.create)
    .put('/update', activityHeadMappingService.validate(), activityHeadMappingService.update)


module.exports = router;