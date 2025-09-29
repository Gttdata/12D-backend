const express = require('express');
const router = express.Router();
const ticketGroupService = require('../../Services/Masters/ticketGroup');

router
    .post('/get', ticketGroupService.get)
    .post('/create', ticketGroupService.validate(), ticketGroupService.create)
    .put('/update', ticketGroupService.validate(), ticketGroupService.update)
    .post('/getParent',ticketGroupService.getParent)

module.exports = router;