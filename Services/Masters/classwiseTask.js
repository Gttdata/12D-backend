const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async');
const applicationkey = process.env.APPLICATION_KEY;

var classwiseTask = "classwise_task";
var viewClasswiseTask = "view_" + classwiseTask;


function reqData(req) {

    var data = {
        DESCRIPTION: req.body.DESCRIPTION,
        DATE: req.body.DATE,
        CLASS_ID: req.body.CLASS_ID,
        ATTACMENT: req.body.ATTACMENT,
        APPLIED_TIME: req.body.APPLIED_TIME,
        TEACHER_ID: req.body.TEACHER_ID,
        STATUS: req.body.STATUS,
        SUBMISSION_DATE: req.body.SUBMISSION_DATE,
        TYPE: req.body.TYPE,
        SUBJECT_ID: req.body.SUBJECT_ID,
        DIVISION_ID: req.body.DIVISION_ID,
        YEAR_ID: req.body.YEAR_ID,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('DESCRIPTION').optional(), body('DATE').optional(), body('CLASS_ID').isInt().optional(), body('ATTACMENT').optional(), body('APPLIED_TIME').optional(), body('TEACHER_ID').optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewClasswiseTask + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get classwiseTasks count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewClasswiseTask + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get classwiseTask information."
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
            mm.executeQueryData('INSERT INTO ' + classwiseTask + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save classwiseTask information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "ClasswiseTask information saved successfully...",
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
            if (data.DESCRIPTION == "" || data.DESCRIPTION == null) {
                setData += ` DESCRIPTION = ? ,`
                recordData.push('')
            }
            if (data.ATTACMENT == "" || data.ATTACMENT == null) {
                setData += ` ATTACMENT = ? ,`
                recordData.push('')
            }

            mm.executeQueryData(`UPDATE ` + classwiseTask + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update classwiseTask information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "ClasswiseTask information updated successfully...",
                    });
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}


exports.assignTaskOLD = (req, res) => {
    const errors = validationResult(req);
    //console.log(req.body);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    data.STATUS = "A"
    var YEAR_ID = req.body.YEAR_ID
    var CLASS_ID = req.body.CLASS_ID
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
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
            if (YEAR_ID != null && CLASS_ID != null) {
                const connection = mm.openConnection();
                mm.executeDML(`SELECT GROUP_CONCAT(STUDENT_ID) STUDENTS from student_class_mapping WHERE YEAR_ID = ? AND CLASS_ID = ? `, [YEAR_ID, CLASS_ID], supportKey, connection, (error, results) => {
                    if (error) {

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to get studentDetails."
                        });
                    }
                    else {
                        var STUDENTS = results[0].STUDENTS?.split(',');
                        if (STUDENTS?.length > 0) {
                            mm.executeDML(`UPDATE classwise_task SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                                if (error) {

                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to update studentTaskDetails information."
                                    });
                                }
                                else {
                                    var recData = [];
                                    for (let i = 0; i < STUDENTS.length; i++) {
                                        const element = STUDENTS[i];
                                        var rec = [criteria.ID, element, systemDate, 1, "P"]
                                        recData.push(rec)
                                    }
                                    mm.executeDML(`INSERT INTO student_task_details (TASK_ID,STUDENT_ID,ASSIGNED_DATE,CLIENT_ID,STATUS) values ?`, [recData], supportKey, connection, (error, results) => {
                                        if (error) {

                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            console.log(error);
                                            mm.rollbackConnection(connection);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to update studentTaskDetails information."
                                            });
                                        }
                                        else {
                                            mm.commitConnection(connection);
                                            res.send({
                                                "code": 200,
                                                "message": "StudentTaskDetails information updated successfully...",
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 300,
                                "message": "No Student found...",
                            });
                        }
                    }
                });
            } else {
                res.send({
                    "code": 301,
                    "message": "Class or Year not found...",
                });
            }
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.getData = (req, res) => {

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
        mm.executeQuery('select count(*) as cnt from ' + viewClasswiseTask + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get classwiseTasks count.",
                });
            }
            else {
                mm.executeQuery('select *,(SELECT COUNT(ID) from student_task_details where TASK_ID = m.ID AND STATUS = "C") AS COMPLETED,(SELECT COUNT(ID) from student_task_details where TASK_ID = m.ID AND STATUS = "P") AS PENDING from view_classwise_task m where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get classwiseTask information."
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

exports.assignTask = (req, res) => {
    const errors = validationResult(req);
    //console.log(req.body);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    data.STATUS = "A"
    var YEAR_ID = req.body.YEAR_ID
    var CLASS_ID = req.body.CLASS_ID
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
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
            if (YEAR_ID != null && CLASS_ID != null) {
                const connection = mm.openConnection();
                mm.executeDML(`SELECT GROUP_CONCAT(STUDENT_ID) STUDENTS from student_class_mapping WHERE YEAR_ID = ? AND CLASS_ID = ? `, [YEAR_ID, CLASS_ID], supportKey, connection, (error, results) => {
                    if (error) {

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to get studentDetails."
                        });
                    }
                    else {
                        var STUDENTS = results[0].STUDENTS?.split(',');
                        if (STUDENTS?.length > 0) {
                            mm.executeDML(`UPDATE classwise_task SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                                if (error) {

                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to update studentTaskDetails information."
                                    });
                                }
                                else {
                                    async.eachSeries(STUDENTS, function iteratorOverElems(element, callback) {
                                        var recData = [criteria.ID, element, systemDate, 1, "C"];
                                        mm.executeDML(`INSERT INTO student_task_details (TASK_ID,STUDENT_ID,ASSIGNED_DATE,CLIENT_ID,STATUS) values (?,?,?,?,?)`, [criteria.ID, element, systemDate, 1, "P"], supportKey, connection, (error, results) => {
                                            if (error) {
                                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                callback(error)
                                            }
                                            else {
                                                mm.executeDML(`SELECT * FROM view_student_task_details WHERE TASK_ID = ? AND STUDENT_ID = ?`, [criteria.ID, element], supportKey, connection, (error, resultData) => {
                                                    if (error) {
                                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                        callback(error)
                                                    }
                                                    else {
                                                        var TITLE = `New Task from ${resultData[0].TEACHER_NAME}`
                                                        var DESCRIPTION = `Dear ${resultData[0].STUDENT_NAME},
                                                                        You have a new task assigned in ${resultData[0].CLASS_NAME}. Tap to view details.`

                                                        mm.sendNotificationToId(element, TITLE, DESCRIPTION, "TTT", "", supportKey, (err, notification) => {
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
                                    }, function (err) {
                                        if (err) {
                                            console.log(err);
                                            mm.rollbackConnection(connection);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to update studentTaskDetails information."
                                            });
                                        }
                                        else {
                                            mm.commitConnection(connection);
                                            res.send({
                                                "code": 200,
                                                "message": "StudentTaskDetails information updated successfully...",
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 300,
                                "message": "No Student found...",
                            });
                        }
                    }
                });
            } else {
                res.send({
                    "code": 301,
                    "message": "Class or Year not found...",
                });
            }
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}
