const express = require('express');
const router = express.Router();
const ageCategoryMasterService = require('../../Services/TrackBook/ageCategory.js');

router
    .post('/get', ageCategoryMasterService.get)
    .post('/create', ageCategoryMasterService.validate(), ageCategoryMasterService.create)
    .put('/update', ageCategoryMasterService.validate(), ageCategoryMasterService.update)


module.exports = router;