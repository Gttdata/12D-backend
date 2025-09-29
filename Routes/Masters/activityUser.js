const express = require('express');
const router = express.Router();
const activityUserMasterService = require('../../Services/Masters/activityUser.js');

router
    .post('/get', activityUserMasterService.get)
    .post('/create', activityUserMasterService.validate(), activityUserMasterService.create)
    .put('/update', activityUserMasterService.validate(), activityUserMasterService.update)
    .post('/add', activityUserMasterService.validate(), activityUserMasterService.add)
    .post('/getPreArrengeActivity', activityUserMasterService.getPreArrengeActivity)
    
module.exports = router;