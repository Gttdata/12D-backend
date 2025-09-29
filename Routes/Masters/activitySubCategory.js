const express = require('express');
const router = express.Router();
const activitySubCategoryService = require('../../Services/Masters/activitySubCategory');

router
    .post('/get', activitySubCategoryService.get)
    .post('/create', activitySubCategoryService.validate(), activitySubCategoryService.create)
    .put('/update', activitySubCategoryService.validate(), activitySubCategoryService.update)


module.exports = router;