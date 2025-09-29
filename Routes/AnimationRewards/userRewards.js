const express = require('express');
const router = express.Router();
const userRewardsService = require('../../Services/AnimationRewards/userRewards.js');

router
    .post('/get', userRewardsService.get)
    .post('/create', userRewardsService.validate(), userRewardsService.create)
    .put('/update', userRewardsService.validate(), userRewardsService.update)


module.exports = router;
