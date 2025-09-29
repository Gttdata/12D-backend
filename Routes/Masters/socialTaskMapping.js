const express = require('express');
const router = express.Router();
const socialTaskMappingService = require('../../Services/Masters/socialTaskMapping');

router
.post('/get',socialTaskMappingService.get)
.post('/create',socialTaskMappingService.validate(),socialTaskMappingService.create)
.put('/update',socialTaskMappingService.validate(),socialTaskMappingService.update)


module.exports = router;