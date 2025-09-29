const express = require('express');
const router = express.Router();
const animationRewardsService = require('../../Services/AnimationRewards/animationRewards.js');

router
    .post('/get', animationRewardsService.get)
    .post('/create', animationRewardsService.validate(), animationRewardsService.create)
    .put('/update', animationRewardsService.validate(), animationRewardsService.update)


module.exports = router;