const express = require('express');
const router = express.Router();
const classwiseTaskService = require('../../Services/Masters/classwiseTask.js');

router
    .post('/get', classwiseTaskService.get)
    .post('/create', classwiseTaskService.validate(), classwiseTaskService.create)
    .put('/update', classwiseTaskService.validate(), classwiseTaskService.update)
    .post('/assignTask', classwiseTaskService.assignTask)
    .post('/getData', classwiseTaskService.getData)


module.exports = router;