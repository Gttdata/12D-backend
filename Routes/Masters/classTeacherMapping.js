const express = require('express');
const router = express.Router();
const classTeacherMappingService = require('../../Services/Masters/classTeacherMapping');

router
    .post('/get', classTeacherMappingService.get)
    .post('/create', classTeacherMappingService.validate(), classTeacherMappingService.create)
    .put('/update', classTeacherMappingService.validate(), classTeacherMappingService.update)


module.exports = router;