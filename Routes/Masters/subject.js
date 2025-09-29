const express = require('express');
const router = express.Router();
const subjectMasterService = require('../../Services/Masters/subject.js');

router
    .post('/get', subjectMasterService.get)
    .post('/create', subjectMasterService.validate(), subjectMasterService.create)
    .put('/update', subjectMasterService.validate(), subjectMasterService.update)
    .post('/map', subjectMasterService.map)
    .post('/add', subjectMasterService.add)


module.exports = router;