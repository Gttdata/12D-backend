const express = require('express');
const router = express.Router();
const globalSettingsService = require('../Services/globalSettings');

router
    .post('/getVersion', globalSettingsService.getVersion)
    //.post('/create',globalSettingsService.validate(),globalSettingsService.create)
    .put('/updatedVersion',globalSettingsService.updatedVersion)
    .post('/getDetoxInfo',globalSettingsService.getDetoxInfo)


module.exports = router;