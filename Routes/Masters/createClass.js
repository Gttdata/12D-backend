const express = require('express');
const router = express.Router();
const createClassService = require('../../Services/Masters/createClass');

router
    .post('/get', createClassService.get)
    .post('/create', createClassService.validate(), createClassService.create)
    .put('/update', createClassService.validate(), createClassService.update)


module.exports = router;