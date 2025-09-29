const express = require('express');
const router = express.Router();
const dashBoardService = require('../../Services/Reports/dashBoard.js');

router
    .post('/getAllCount', dashBoardService.getAllCount)
    .post('/classWiseFeeCount', dashBoardService.classWiseFeeCount)
    .post('/taskStatus', dashBoardService.taskStatus)


module.exports = router;