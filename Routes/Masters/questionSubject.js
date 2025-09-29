const express = require('express');
const router = express.Router();
const questionSubjectMasterService = require('../../Services/Masters/questionSubject.js');

router
    .post('/get', questionSubjectMasterService.get)
    .post('/create', questionSubjectMasterService.validate(), questionSubjectMasterService.create)
    .put('/update', questionSubjectMasterService.validate(), questionSubjectMasterService.update)


module.exports = router;