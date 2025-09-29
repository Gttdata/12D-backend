const express = require('express');
const router = express.Router();
const createDivisionService = require('../../Services/Masters/createDivision.js');

router
    .post('/get', createDivisionService.get)
    .post('/create', createDivisionService.validate(), createDivisionService.create)
    .put('/update', createDivisionService.validate(), createDivisionService.update)


module.exports = router;