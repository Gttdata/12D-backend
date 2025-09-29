const express = require('express');
const router = express.Router();
const schoolRegistrationService = require('../../Services/Masters/schoolRegistration');

router
    .post('/get', schoolRegistrationService.get)
    .post('/create', schoolRegistrationService.validate(), schoolRegistrationService.create)
    .put('/update', schoolRegistrationService.validate(), schoolRegistrationService.update)


module.exports = router;