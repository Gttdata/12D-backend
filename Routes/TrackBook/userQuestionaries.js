const express = require('express');
const router = express.Router();
const userQuestionariesService = require('../../Services/TrackBook/userQuestionaries.js');

router
    .post('/get', userQuestionariesService.get)
    .post('/create', userQuestionariesService.validate(), userQuestionariesService.create)
    .put('/update', userQuestionariesService.validate(), userQuestionariesService.update)
    .post('/add', userQuestionariesService.add)
    

module.exports = router;