const express = require('express');
const router = express.Router();

var globalService = require('../Services/global');

router

    .use('*', globalService.checkAuth)
    .use('/api', globalService.checkToken)

    // User Access
    // .post('/appUser/sendRegistrationOTP', require('../Services/Masters/appUser').sendRegistrationOTP)
    // .post('/appUser/verifyRegistrationOTP', require('../Services/Masters/appUser').verifyRegistrationOTP)
    .use('/api/form', require('./UserAccess/form'))
    .use('/api/role', require('./UserAccess/role'))
    .use('/api/roleDetails', require('./UserAccess/roleDetail'))
    .use('/api/user', require('./UserAccess/user'))
    .use('/api/userRoleMapping', require('./UserAccess/userRoleMapping'))
    .post('/user/login', require('../Services/UserAccess/user').login)
    .post('/appUser/loginTeacher', require('../Services/Masters/appUser').loginTeacher)
    .post('/appUser/verifyLoginOTP', require('../Services/Masters/appUser').verifyLoginOTP)
    .post('/appUser/sendLoginOTP', require('../Services/Masters/appUser').sendLoginOTP)
    .post('/appUser/register', require('../Services/Masters/appUser').register)
    .post('/school/sendRegistrationOTP', require('../Services/Masters/school').sendRegistrationOTP)
    .post('/school/verifyRegistrationOTP', require('../Services/Masters/school').verifyRegistrationOTP)
    .use('/globalSettings', require('./globalSettings'))


    // Masters Forms
    // .use('/api/student', require('./Masters/student'))
    // .use('/api/teacher', require('./Masters/teacher'))
    .use('/api/banner', require('./Masters/banner'))
    .use('/api/state', require('./Masters/state'))
    .use('/api/city', require('./Masters/city'))
    .use('/api/district', require('./Masters/district'))
    .use('/api/country', require('./Masters/country'))
    .use('/api/schoolRegistration', require('./Masters/schoolRegistration'))
    .use('/api/socialTaskMapping', require('./Masters/socialTaskMapping'))
    .use('/api/advertisement', require('./Masters/advertisement'))
    .use('/api/ageGroup', require('./Masters/ageGroup'))
    .use('/api/school', require('./Masters/school'))
    .use('/school/get', require('../Services/Masters/school').get)
    .post('/createClass/get', require('../Services/Masters/createClass').get)
    .post('/createDivision/get', require('../Services/Masters/createDivision').get)
    .use('/api/createClass', require('./Masters/createClass'))
    .use('/api/year', require('./Masters/year'))
    .use('/api/classTeacherMapping', require('./Masters/classTeacherMapping'))
    .use('/api/studentClassMapping', require('./Masters/studentClassMapping'))
    .use('/api/studentFeeDetails', require('./Masters/studentFeeDetails'))
    .use('/api/holiday', require('./Masters/holiday'))
    .use('/api/classWiseTask', require('./Masters/classWiseTask'))
    .use('/api/studentTaskDetails', require('./Masters/studentTaskDetails'))
    .use('/api/subject', require('./Masters/subject'))
    .use('/api/questionType', require('./Masters/questionType'))
    .use('/api/chapter', require('./Masters/chapter'))
    .use('/api/question', require('./Masters/question'))
    .use('/api/questionOptionsMapping', require('./Masters/questionOptionsMapping'))
    .use('/api/board', require('./Masters/board'))
    .use('/api/medium', require('./Masters/medium'))
    .use('/api/questionPaperClass', require('./Masters/questionPaperClass'))
    .use('/api/classFeeMapping', require('./Masters/classFeeMapping'))
    .use('/api/createDivision', require('./Masters/createDivision'))
    .use('/api/feeHead', require('./Masters/feeHead'))
    .use('/api/appUser', require('./Masters/appUser'))
    .use('/api/questionSubject', require('./Masters/questionSubject'))
    .use('/api/subjectTeacherMapping', require('./Masters/subjectTeacherMapping'))
    .use('/api/attendance', require('./Masters/attendance'))
    .use('/api/attendanceDetails', require('./Masters/attendanceDetails'))
    .use('/api/boardMedium', require('./Masters/boardMedium'))
    .use('/api/studentFee', require('./Masters/studentFee'))
    .use('/api/memberTodo', require('./Masters/memberTodo'))
    .use('/api/ticketGroup', require('./Masters/ticketGroup'))
    .use('/api/notification', require('./Masters/notification'))
    .use('/api/activity', require('./Masters/activity'))
    .use('/api/activityHead', require('./Masters/activityHead'))
    .use('/api/activityUserMapping', require('./Masters/activityUserMapping'))
    .use('/api/activityUser', require('./Masters/activityUser'))
    .use('/api/activityHeadMapping', require('./Masters/activityHeadMapping'))

    //TrackBook
    .use('/api/ageCategory', require('./TrackBook/ageCategory'))
    .use('/api/diamentions', require('./TrackBook/diamentions'))
    .use('/api/optionTaskMapping', require('./TrackBook/optionTaskMapping'))
    .use('/api/questionary', require('./TrackBook/questionary'))
    .use('/api/questionaryOptions', require('./TrackBook/questionaryOptions'))
    .use('/api/task', require('./TrackBook/task'))
    .use('/api/userQuestionaries', require('./TrackBook/userQuestionaries'))
    .use('/api/userTrackbook', require('./TrackBook/userTrackbook'))

    //Subscription
    .use('/api/subscription', require('./Subscription/subscription'))
    .use('/api/userSubscription', require('./Subscription/userSubscription'))
    .use('/api/userSubscriptionDetails', require('./Subscription/userSubscriptionDetails'))
    .use('/api/coupon', require('./Subscription/coupon'))
    .use('/api/couponUsage', require('./Subscription/couponUsage'))

    //AnimationRewards
    .use('/api/animation', require('./AnimationRewards/animation'))
    .use('/api/animationDetails', require('./AnimationRewards/animationDetails'))
    .use('/api/animationRewards', require('./AnimationRewards/animationRewards'))
    .use('/api/userAnimationDetails', require('./AnimationRewards/userAnimationDetails'))
    .use('/api/userRewards', require('./AnimationRewards/userRewards'))

    //web
    .post('/web/state/get', require('../Services/Masters/state').get)
    .post('/web/city/get', require('../Services/Masters/city').get)
    .post('/web/district/get', require('../Services/Masters/district').get)
    .post('/web/country/get', require('../Services/Masters/country').get)

    // school Management
    .use('/api/createDivision', require('./SchoolManagement/createDivision'))

    //upload
    // .post('/upload/studentProfile', globalService.studentProfile)
    // .post('/upload/teacherProfile', globalService.teacherProfile)
    .post('/upload/advertisementImage', globalService.advertisementImage)
    .post('/upload/classWiseTask', globalService.classWiseTask)
    .post('/web/removeFile', globalService.removeFile)
    .post('/upload/studentExcel', globalService.studentExcel)
    .post('/upload/answerImage', globalService.answerImage)
    .post('/upload/questionImage', globalService.questionImage)
    .post('/upload/optionImage', globalService.optionImage)
    .post('/upload/taskAttachment', globalService.taskAttachment)
    .post('/upload/appUserProfile', globalService.appUserProfile)
    .post('/upload/ticketImage', globalService.ticketImage)
    .post('/upload/instituteLogo', globalService.instituteLogo)
    .post('/upload/activityHeadImage', globalService.activityHeadImage)
    .post('/upload/activityGIF', globalService.activityGIF)
    .post('/upload/taskImage', globalService.taskImage)
    .post('/upload/rewardImage', globalService.rewardImage)
    .post('/upload/animationVideo', globalService.animationVideo)
    .post('/upload/diamentionImage', globalService.diamentionImage)
    .post('/upload/bannerImage', globalService.bannerImage)

    // Reports
    .use('/api/attendanceReport', require('./Reports/attendanceReport'))
    .use('/api/dashBoard', require('./Reports/dashBoard'))
    .use('/api/schoolReports', require('./Reports/schoolReports'))

    // New Added Routes
    .use('/api/activityCategory', require('./Masters/activityCategory'))
    .use('/api/activitySubCategory', require('./Masters/activitySubCategory'))
    .post('/upload/activityCategoryImage', globalService.activityCategoryImage)

    // 01 July
    .post('/upload/appLogsFiles', globalService.appLogsFiles)
    .use('/api/userAppLogs', require('./Masters/userAppLogs'))
    .use('/api/periodTracking', require('./Masters/periodTracking'))
    .use('/api/userBmi', require('./Masters/userBmi'))

    // 22 July
    .post('/upload/activityThumbnailGIF', globalService.activityThumbnailGIF)

    .post('/upload/templateImage', globalService.templateImage)
    // 26 July
    .use('/api/whatsAppMessageHistory', require('./Masters/whatsAppMessageHistory'))
    .use('/api/emailMessageHistory', require('./Masters/emailMessageHistory'))
    .post('/contactUs/create', require('../Services/Masters/contactUs').create)
    .use('/api/contactUs', require('./Masters/contactUs'))

module.exports = router;


