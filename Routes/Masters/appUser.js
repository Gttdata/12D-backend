const express = require('express');
const router = express.Router();
const appUserMasterService = require('../../Services/Masters/appUser.js');
const { update } = require('../../Services/UserAccess/form.js');
const { create } = require('../../Services/Masters/city.js');

router
    .post('/get', appUserMasterService.get)
    .post('/create', appUserMasterService.validate(), appUserMasterService.create)
    .put('/update', appUserMasterService.validate(), appUserMasterService.update)
    .post('/addTeacher', appUserMasterService.addTeacher)
    .post('/updateTeacher', appUserMasterService.updateTeacher)
    .post('/approveRejectTeacher', appUserMasterService.approveRejectTeacher)
    .post('/getTeacherCount', appUserMasterService.getTeacherCount)
    .post('/importStudents', appUserMasterService.importStudents)
    .post('/promoteStudents', appUserMasterService.promoteStudents)
    .post('/createStudents', appUserMasterService.createStudents)
    .post('/mapClassStudent', appUserMasterService.mapClassStudent)
    .post('/getStudentCount', appUserMasterService.getStudentCount)
    .post('/approveRejectStudent', appUserMasterService.approveRejectStudent)
    
    .post('/getAppUserSummary', appUserMasterService.getAppUserSummary)
    .post('/sendRegistrationMessage', appUserMasterService.sendRegistrationMessage)


module.exports = router;
