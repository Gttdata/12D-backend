const express = require('express');
const router = express.Router();
const activityUserMappingService = require('../../Services/Masters/activityUserMapping.js');

router
    .post('/get', activityUserMappingService.get)
    .post('/create', activityUserMappingService.validate(), activityUserMappingService.create)
    .put('/update', activityUserMappingService.validate(), activityUserMappingService.update)


module.exports = router;