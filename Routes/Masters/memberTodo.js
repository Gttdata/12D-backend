const express = require('express');
const router = express.Router();
const memberTodoService = require('../../Services/Masters/memberTodo.js');

router
    .post('/get', memberTodoService.get)
    .post('/create', memberTodoService.validate(), memberTodoService.create)
    .put('/update', memberTodoService.validate(), memberTodoService.update)
    .post('/add', memberTodoService.add)
    .post('/updateSeries', memberTodoService.updateSeries)
    .post('/remove', memberTodoService.remove)


module.exports = router;