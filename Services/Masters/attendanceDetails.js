const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");


const applicationkey = process.env.APPLICATION_KEY;

var attendanceDetails = "attendance_details";
var viewAttendanceDetails = "view_" + attendanceDetails;


function reqData(req) {

    var data = {
        ATTENDENCE_ID: req.body.ATTENDENCE_ID,
        SUBJECT_ID: req.body.SUBJECT_ID,
        TEACHER_ID: req.body.TEACHER_ID,
        LECTURE_TIME: req.body.LECTURE_TIME,
        STATUS: req.body.STATUS ? '1' : '0',

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('ATTENDENCE_ID').isInt(), body('SUBJECT_ID').isInt(), body('TEACHER_ID').isInt(), body('LECTURE_TIME', ' parameter missing').exists(), body('STATUS', ' parameter missing').exists(), body('ID').optional(),


    ]
}


exports.get = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    console.log(pageIndex + " " + pageSize)
    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
        console.log(start + " " + end);
    }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select count(*) as cnt from ' + viewAttendanceDetails + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceDetails count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewAttendanceDetails + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get attendanceDetails information."
                        });
                    }
                    else {


                        res.send({
                            "code": 200,
                            "message": "success",
                            "count": results1[0].cnt,
                            "data": results
                        });
                    }
                });
            }
        });
    } catch (error) {
        
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }

}


exports.create = (req, res) => {

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];

    if (!errors.isEmpty()) {

        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQueryData('INSERT INTO ' + attendanceDetails + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save attendanceDetails information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "AttendanceDetails information saved successfully...",
                    });
                }
            });
        } catch (error) {
            
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}


exports.update = (req, res) => {
    const errors = validationResult(req);
    //console.log(req.body);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {

        //data[key] ? setData += `${key}= '${data[key]}', ` : true;
        // setData += `${key}= :"${key}", `;
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQueryData(`UPDATE ` + attendanceDetails + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update attendanceDetails information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "AttendanceDetails information updated successfully...",
                    });
                }
            });
        } catch (error) {
            
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}


exports.getCount = (req, res) => {

    // var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';
    // var pageSize = req.body.pageSize ? req.body.pageSize : '';
    // var start = 0;
    // var end = 0;

    // if (pageIndex != '' && pageSize != '') {
    //     start = (pageIndex - 1) * pageSize;
    //     end = pageSize;
    // }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'DATE';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    // if (pageIndex === '' && pageSize === '')
    criteria = filter + " GROUP BY DATE order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('SELECT DATE,COUNT(STATUS) TOTAL, COUNT(IF(STATUS="P",1,null)) PRESENT, COUNT(IF(STATUS="A",1,null)) ABSENT from view_attendance_details where 1 ' + criteria, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceDetails information."
                });
            }
            else {
                res.send({
                    "code": 200,
                    "message": "success",
                    "data": results
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Somthing went wrong..."
        })
    }
}

exports.getSubjectCount = (req, res) => {

    // var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';
    // var pageSize = req.body.pageSize ? req.body.pageSize : '';
    // var start = 0;
    // var end = 0;

    // if (pageIndex != '' && pageSize != '') {
    //     start = (pageIndex - 1) * pageSize;
    //     end = pageSize;
    // }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'DATE';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    // if (pageIndex === '' && pageSize === '')
    criteria = filter + " GROUP BY DATE,SUBJECT_ID,LECTURE_TIME order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('SELECT SUBJECT_NAME,SUBJECT_ID,LECTURE_TIME,DATE,COUNT(STATUS) TOTAL, COUNT(IF(STATUS="P",1,null)) PRESENT, COUNT(IF(STATUS="A",1,null)) ABSENT from view_attendance_details where 1 ' + criteria, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceDetails information."
                });
            }
            else {
                res.send({
                    "code": 200,
                    "message": "success",
                    "data": results
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Somthing went wrong..."
        })
    }
}

