const express = require('express');
const router = express.Router();
const studentFeeDetailsService = require('../../Services/Masters/studentFeeDetails.js');

router
    .post('/get', studentFeeDetailsService.get)
    .post('/create', studentFeeDetailsService.validate(), studentFeeDetailsService.create)
    .put('/update', studentFeeDetailsService.validate(), studentFeeDetailsService.update)
    


module.exports = router;