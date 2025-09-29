const express = require('express');
const router = express.Router();
const activityCategoryService = require('../../Services/Masters/activityCategory');

router
    .post('/get', activityCategoryService.get)
    .post('/create', activityCategoryService.validate(), activityCategoryService.create)
    .put('/update', activityCategoryService.validate(), activityCategoryService.update)


module.exports = router;