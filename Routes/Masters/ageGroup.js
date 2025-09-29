const express = require('express');
const router = express.Router();
const ageGroupMasterService = require('../../Services/Masters/ageGroup');

router
    .post('/get', ageGroupMasterService.get)
    .post('/create', ageGroupMasterService.validate(), ageGroupMasterService.create)
    .put('/update', ageGroupMasterService.validate(), ageGroupMasterService.update)


module.exports = router;