const express = require('express');
const router = express.Router();
const activityMastetrService = require('../../Services/Masters/activity.js');

router
    .post('/get', activityMastetrService.get)
    .post('/create', activityMastetrService.validate(), activityMastetrService.create)
    .put('/update', activityMastetrService.validate(), activityMastetrService.update)
    .post('/add', activityMastetrService.validate(), activityMastetrService.add)
    .post('/modify', activityMastetrService.validate(), activityMastetrService.modify)


module.exports = router;