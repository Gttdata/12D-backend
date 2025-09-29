const express = require('express');
const router = express.Router();
const subjectTeacherMappingService = require('../../Services/Masters/subjectTeacherMapping.JS');

router
    .post('/get', subjectTeacherMappingService.get)
    .post('/create', subjectTeacherMappingService.validate(), subjectTeacherMappingService.create)
    .put('/update', subjectTeacherMappingService.validate(), subjectTeacherMappingService.update)
    .post('/mapBulkSubject', subjectTeacherMappingService.mapBulkSubject)


module.exports = router;