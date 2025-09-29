const express = require('express');
const router = express.Router();
const animationDetailsService = require('../../Services/AnimationRewards/animationDetails.js');

router
    .post('/get', animationDetailsService.get)
    .post('/create', animationDetailsService.validate(), animationDetailsService.create)
    .put('/update', animationDetailsService.validate(), animationDetailsService.update)


module.exports = router;