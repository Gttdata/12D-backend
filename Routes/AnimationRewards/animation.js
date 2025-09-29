const express = require('express');
const router = express.Router();
const animationMasterService = require('../../Services/AnimationRewards/animation.js');

router
    .post('/get', animationMasterService.get)
    .post('/create', animationMasterService.validate(), animationMasterService.create)
    .put('/update', animationMasterService.validate(), animationMasterService.update)
    
    .post('/getAnimationSummary', animationMasterService.getAnimationSummary)
    .post('/getUserAnimationCompletion', animationMasterService.getUserAnimationCompletion)

module.exports = router;