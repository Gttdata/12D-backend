const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async')

const applicationkey = process.env.APPLICATION_KEY;

var attendanceMaster = "attendance_master";
var viewAttendanceMaster = "view_" + attendanceMaster;


function reqData(req) {

    var data = {
        STUDENT_ID: req.body.STUDENT_ID,
        DIVISION_ID: req.body.DIVISION_ID,
        CLASS_ID: req.body.CLASS_ID,
        DATE: req.body.DATE,
        IS_CLASS_ATTENDENCE: req.body.IS_CLASS_ATTENDENCE ? '1' : '0',

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('STUDENT_ID').isInt().optional(), body('DIVISION_ID').isInt().optional(), body('CLASS_ID').isInt().optional(), body('DATE').optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewAttendanceMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceMaster count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewAttendanceMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get attendanceMaster information."
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
            mm.executeQueryData('INSERT INTO ' + attendanceMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save attendanceMaster information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "AttendanceMaster information saved successfully...",
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

            mm.executeQueryData(`UPDATE ` + attendanceMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update attendanceMaster information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "AttendanceMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.markAttendanceOLD = (req, res) => {
    var supportKey = req.headers['supportkey'];
    var SUBJECT_DETAILS = req.body.SUBJECT_DETAILS;
    var CLASS_ID = req.body.CLASS_ID;
    var SUBJECT_ID = req.body.SUBJECT_ID;
    var TEACHER_ID = req.body.TEACHER_ID;
    var LECTURE_TIME = req.body.LECTURE_TIME;
    var CLASS_ID = req.body.CLASS_ID;
    var DATE = req.body.DATE;
    var IS_CLASS_ATTENDENCE = req.body.IS_CLASS_ATTENDENCE;
    var DIVISION_ID = req.body.DIVISION_ID;
    try {
        if (SUBJECT_DETAILS.length > 0) {
            const connection = mm.openConnection();
            async.eachSeries(SUBJECT_DETAILS, function iteratorOverElems(element, callback) {
                mm.executeDML(`SELECT * FROM ATTENDANCE_MASTER WHERE DATE = ? AND DIVISION_ID = ? AND CLASS_ID = ? AND STUDENT_ID = ?`, [DATE, DIVISION_ID, CLASS_ID, element.STUDENT_ID], supportKey, connection, (error, resultcheck) => {
                    if (error) {
                        console.log(error);
                        callback(error);
                    }
                    else {
                        var Query = ``
                        var QueryData = [];
                        if (resultcheck.length > 0) {
                            Query = `UPDATE ATTENDANCE_MASTER SET STUDENT_ID = ?,DIVISION_ID = ?,CLASS_ID = ?,DATE = ?,IS_CLASS_ATTENDENCE = ? WHERE DATE = ? AND DIVISION_ID = ? AND CLASS_ID = ? AND STUDENT_ID = ?`
                            QueryData = [element.STUDENT_ID, DIVISION_ID, CLASS_ID, DATE, IS_CLASS_ATTENDENCE, DATE, DIVISION_ID, CLASS_ID, element.STUDENT_ID]
                        } else {
                            Query = `INSERT INTO ATTENDANCE_MASTER (STUDENT_ID,DIVISION_ID,CLASS_ID,DATE,IS_CLASS_ATTENDENCE,CLIENT_ID) values (?,?,?,?,?,?)`
                            QueryData = [element.STUDENT_ID, DIVISION_ID, CLASS_ID, DATE, IS_CLASS_ATTENDENCE, 1]
                        }
                        mm.executeDML(Query, QueryData, supportKey, connection, (error, resultAttendance) => {
                            if (error) {
                                console.log(error);
                                callback(error);
                            }
                            else {
                                var ATTENDENCE_ID = resultcheck.length > 0 ? resultcheck[0].ID : resultAttendance.insertId;
                                mm.executeDML(`INSERT INTO ATTENDANCE_DETAILS(ATTENDENCE_ID,SUBJECT_ID,TEACHER_ID,LECTURE_TIME,STATUS,CLIENT_ID) values (?,?,?,?,?,?)`, [ATTENDENCE_ID, SUBJECT_ID, TEACHER_ID, LECTURE_TIME, element.STATUS, 1], supportKey, connection, (error, results) => {
                                    if (error) {
                                        console.log(error);
                                        callback(error);
                                    }
                                    else {
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });
            }, function subCb(error) {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    mm.rollbackConnection(connection)
                    res.send({
                        "code": 400,
                        "message": "Failed to save attendance_details information..."
                    });
                } else {
                    mm.commitConnection(connection)
                    res.send({
                        "code": 200,
                        "message": "attendance_details information updated successfully...",
                    });
                }
            });
        } else {
            res.send({
                "code": 300,
                "message": "Please provide Subject details...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
        res.send({
            "code": 500,
            "message": "something went wrong...",
        });
    }
}

exports.markAttendance = (req, res) => {
    var supportKey = req.headers['supportkey'];
    var SUBJECT_DETAILS = req.body.SUBJECT_DETAILS;
    var CLASS_ID = req.body.CLASS_ID;
    var SUBJECT_ID = req.body.SUBJECT_ID;
    var TEACHER_ID = req.body.TEACHER_ID;
    var LECTURE_TIME = req.body.LECTURE_TIME;
    var CLASS_ID = req.body.CLASS_ID;
    var DATE = req.body.DATE;
    var IS_CLASS_ATTENDENCE = req.body.IS_CLASS_ATTENDENCE;
    var DIVISION_ID = req.body.DIVISION_ID;
    try {
        if (SUBJECT_DETAILS.length > 0) {
            const connection = mm.openConnection();
            async.eachSeries(SUBJECT_DETAILS, function iteratorOverElems(element, callback) {
                mm.executeDML(`SELECT * FROM ATTENDANCE_MASTER WHERE DATE = ? AND DIVISION_ID = ? AND CLASS_ID = ? AND STUDENT_ID = ?`, [DATE, DIVISION_ID, CLASS_ID, element.STUDENT_ID], supportKey, connection, (error, resultcheck) => {
                    if (error) {
                        console.log(error);
                        callback(error);
                    }
                    else {
                        var Query = ``
                        var QueryData = [];
                        if (resultcheck.length > 0) {
                            Query = `UPDATE ATTENDANCE_MASTER SET STUDENT_ID = ?,DIVISION_ID = ?,CLASS_ID = ?,DATE = ?,IS_CLASS_ATTENDENCE = ? WHERE DATE = ? AND DIVISION_ID = ? AND CLASS_ID = ? AND STUDENT_ID = ?`
                            QueryData = [element.STUDENT_ID, DIVISION_ID, CLASS_ID, DATE, IS_CLASS_ATTENDENCE, DATE, DIVISION_ID, CLASS_ID, element.STUDENT_ID]
                        } else {
                            Query = `INSERT INTO ATTENDANCE_MASTER (STUDENT_ID,DIVISION_ID,CLASS_ID,DATE,IS_CLASS_ATTENDENCE,CLIENT_ID) values (?,?,?,?,?,?)`
                            QueryData = [element.STUDENT_ID, DIVISION_ID, CLASS_ID, DATE, IS_CLASS_ATTENDENCE, 1]
                        }
                        mm.executeDML(Query, QueryData, supportKey, connection, (error, resultAttendance) => {
                            if (error) {
                                console.log(error);
                                callback(error);
                            }
                            else {
                                var ATTENDENCE_ID = resultcheck.length > 0 ? resultcheck[0].ID : resultAttendance.insertId;
                                mm.executeDML(`INSERT INTO ATTENDANCE_DETAILS(ATTENDENCE_ID,SUBJECT_ID,TEACHER_ID,LECTURE_TIME,STATUS,CLIENT_ID) values (?,?,?,?,?,?)`, [ATTENDENCE_ID, SUBJECT_ID, TEACHER_ID, LECTURE_TIME, element.STATUS, 1], supportKey, connection, (error, results) => {
                                    if (error) {
                                        console.log(error);
                                        callback(error);
                                    }
                                    else {
                                        mm.executeDML(`SELECT * FROM VIEW_ATTENDANCE_DETAILS where ATTENDENCE_ID = ?`, [ATTENDENCE_ID], supportKey, connection, (error, resultData) => {
                                            if (error) {
                                                console.log(error);
                                                callback(error);
                                            }
                                            else {
                                                var TITLE = `Attendance Update for ${resultData[0].CLASS_NAME}`
                                                var DESCRIPTION = `Dear ${resultData[0].STUDENT_NAME},
                                                                Your attendance for ${resultData[0].CLASS_NAME} has been recorded by ${resultData[0].TEACHER_NAME}.`

                                                mm.sendNotificationToId(element.STUDENT_ID, TITLE, DESCRIPTION, "ATT", JSON.stringify(element), supportKey, (err, notification) => {
                                                    if (err) {
                                                        callback(err);
                                                        console.log("Notification Send Error", err);
                                                    } else {
                                                        callback();

                                                    }
                                                })
                                            }
                                        })


                                    }
                                });
                            }
                        });
                    }
                });
            }, function subCb(error) {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    mm.rollbackConnection(connection)
                    res.send({
                        "code": 400,
                        "message": "Failed to save attendance_details information..."
                    });
                } else {
                    mm.commitConnection(connection)
                    res.send({
                        "code": 200,
                        "message": "attendance_details information updated successfully...",
                    });
                }
            });
        } else {
            res.send({
                "code": 300,
                "message": "Please provide Subject details...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
        res.send({
            "code": 500,
            "message": "something went wrong...",
        });
    }
}




