const express = require('express');
const router = express.Router();
const contactUsService = require('../../Services/Masters/contactUs.js');

router
.post('/get',contactUsService.get)
.post('/create',contactUsService.validate(),contactUsService.create)
.put('/update',contactUsService.validate(),contactUsService.update)


module.exports = router;