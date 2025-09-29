const express = require('express');
const router = express.Router();
const userBmiService = require('../../Services/Masters/userBmi.js');

router
    .post('/get', userBmiService.get)
    .post('/create', userBmiService.validate(), userBmiService.create)
    .put('/update', userBmiService.validate(), userBmiService.update)


module.exports = router;