const express = require('express');
const router = express.Router();
const diamentionsMasterService = require('../../Services/TrackBook/diamention.js');

router
    .post('/get', diamentionsMasterService.get)
    .post('/create', diamentionsMasterService.validate(), diamentionsMasterService.create)
    .put('/update', diamentionsMasterService.validate(), diamentionsMasterService.update)


module.exports = router;