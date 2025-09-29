const express = require('express');
const router = express.Router();
const studentTaskDetailsService = require('../../Services/Masters/studentTaskDetails.js');

router
    .post('/get', studentTaskDetailsService.get)
    .post('/create', studentTaskDetailsService.validate(), studentTaskDetailsService.create)
    .put('/update', studentTaskDetailsService.validate(), studentTaskDetailsService.update)


module.exports = router;