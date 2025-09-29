const express = require('express');
const router = express.Router();
const userTrackbookService = require('../../Services/TrackBook/userTrackbook.js');

router
    .post('/get', userTrackbookService.get)
    .post('/create', userTrackbookService.validate(), userTrackbookService.create)
    .put('/update', userTrackbookService.validate(), userTrackbookService.update)
    .post('/add', userTrackbookService.add)
    .post('/updateTask', userTrackbookService.updateTask)
    .post('/getTaskCompletionSummary', userTrackbookService.getTaskCompletionSummary)
    .post('/getUserTaskCompletionSummary', userTrackbookService.getUserTaskCompletionSummary)
    .post('/getSummary', userTrackbookService.getSummary)


module.exports = router;