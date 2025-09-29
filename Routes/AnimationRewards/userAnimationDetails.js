const express = require('express');
const router = express.Router();
const userAnimationDetailsService = require('../../Services/AnimationRewards/userAnimationDetails.js');

router
    .post('/get', userAnimationDetailsService.get)
    .post('/create', userAnimationDetailsService.validate(), userAnimationDetailsService.create)
    .put('/update', userAnimationDetailsService.validate(), userAnimationDetailsService.update)
    .post('/addRewards', userAnimationDetailsService.addRewards)
    

module.exports = router;
