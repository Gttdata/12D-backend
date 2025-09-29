const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async');

const applicationkey = process.env.APPLICATION_KEY;

var userTrackbook = "user_trackbook";
var viewUserTrackbook = "view_" + userTrackbook;


function reqData(req) {

    var data = {
        TASK_ID: req.body.TASK_ID,
        USER_ID: req.body.USER_ID,
        ASSIGNED_DATE: req.body.ASSIGNED_DATE,
        COMPLETED_DATE: req.body.COMPLETED_DATE,
        DATE_DIFFERENCE: req.body.DATE_DIFFERENCE,
        ENABLE_TIME: req.body.ENABLE_TIME,
        DISABLE_TIMING: req.body.DISABLE_TIMING,
        STATUS: req.body.STATUS,
        SUBSCRIPTION_DETAILS_ID: req.body.SUBSCRIPTION_DETAILS_ID,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('TASK_ID').isInt().optional(), body('USER_ID').isInt().optional(), body('ASSIGNED_DATE').optional(), body('COMPLETED_DATE').optional(), body('DATE_DIFFERENCE').isInt().optional(), body('ENABLE_TIME').optional(), body('DISABLE_TIMING').optional(), body('ID').optional(),

    ]
}


exports.get = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
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
        mm.executeQuery('select count(*) as cnt from ' + viewUserTrackbook + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userTrackbooks count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewUserTrackbook + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userTrackbook information."
                        });
                    }
                    else {
                        console.log("success", results);
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
            mm.executeQueryData('INSERT INTO ' + userTrackbook + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save userTrackbook information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserTrackbook information saved successfully...",
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
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
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
            mm.executeQueryData(`UPDATE ` + userTrackbook + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userTrackbook information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserTrackbook information updated successfully...",
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}


exports.add = (req, res) => {

    var supportKey = req.headers['supportkey'];
    let TRACKBOOK_DATA = req.body.TRACKBOOK_DATA;
    let USER_SUBSCRIPTION_ID = req.body.USER_SUBSCRIPTION_ID;

    try {
        if (TRACKBOOK_DATA && TRACKBOOK_DATA.length > 0) {
            async.eachSeries(TRACKBOOK_DATA, function iteratorOverElems(element, callback) {
                mm.executeQueryData('INSERT INTO ' + userTrackbook + ' SET ?', element, supportKey, (error, results) => {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback();
                    }
                });
            }, function subCb(error) {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to save Trackbook information..."
                    });
                } else {
                    mm.executeQueryData('UPDATE user_subscription_details SET IS_TRACKBOOK_STARTED = 1 WHERE ID = ?', [USER_SUBSCRIPTION_ID], supportKey, (error, results) => {
                        if (error) {
                            res.send({
                                "code": 400,
                                "message": "Failed to update Trackbook information...",
                            });
                        }
                        else {
                            res.send({
                                "code": 200,
                                "message": "Trackbook information saved successfully...",
                            });
                        }
                    });

                }
            });
        } else {
            res.send({
                "code": 300,
                "message": "No data...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}

exports.updateTaskOLD = (req, res) => {

    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
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
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE ` + userTrackbook + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userTrackbook information."
                    });
                }
                else {
                    mm.executeDML(`SELECT COUNT(ID) INCOMPLETE FROM user_trackbook WHERE ASSIGNED_DATE = ? AND USER_ID = ? AND STATUS = "I" `, [data.ASSIGNED_DATE, data.USER_ID], supportKey, connection, (error, resultsCount) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to get userTrackbook information."
                            });
                        }
                        else {
                            if (resultsCount[0]?.INCOMPLETE > 0) {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "UserTrackbook information updated successfully...",
                                });
                            } else {
                                mm.executeDML(`SELECT ID FROM view_user_rewards where SUBSCRIPTION_DETAILS_ID = ? AND STATUS = "L" ORDER BY SEQ_NO ASC LIMIT 1 `, [data.SUBSCRIPTION_DETAILS_ID], supportKey, connection, (error, resultsID) => {
                                    if (error) {
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to update userTrackbook information."
                                        });
                                    }
                                    else {
                                        if (resultsID[0]?.ID > 0) {
                                            mm.executeDML(`UPDATE user_rewards SET STATUS = "U" where ID = ? `, [resultsID[0]?.ID], supportKey, connection, (error, resultsUR) => {
                                                if (error) {
                                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                    console.log(error);
                                                    mm.rollbackConnection(connection);
                                                    res.send({
                                                        "code": 400,
                                                        "message": "Failed to update userTrackbook information."
                                                    });
                                                }
                                                else {
                                                    mm.commitConnection(connection);
                                                    res.send({
                                                        "code": 200,
                                                        "message": "UserTrackbook information updated successfully New Reward Unlocked...",
                                                    });
                                                }
                                            });
                                        } else {
                                            mm.commitConnection(connection);
                                            res.send({
                                                "code": 200,
                                                "message": "UserTrackbook information updated successfully All Rewards Completed...",
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.updateTask = (req, res) => {

    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });

    const bulkUpdateData = req.body.bulkUpdateData

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            const connection = mm.openConnection();
            async.eachSeries(bulkUpdateData, function iteratorOverElems(element, callback) {
                mm.executeDML(`UPDATE ` + userTrackbook + ` SET STATUS = '${element.STATUS}' , CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${element.ID} `, recordData, supportKey, connection, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        callback(error);
                    }
                    else {
                        callback();
                    }
                });
            }, function (err) {
                if (err) {
                    console.log(err);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userTrackbook information."
                    });
                }
                else {
                    mm.executeDML(`SELECT COUNT(ID) INCOMPLETE FROM user_trackbook WHERE DATE(ASSIGNED_DATE) = ? AND USER_ID = ? AND STATUS IN ('N','U') `, [bulkUpdateData[0].ASSIGNED_DATE, bulkUpdateData[0].USER_ID], supportKey, connection, (error, resultsCount) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to get userTrackbook information."
                            });
                        }
                        else {
                            if (resultsCount[0]?.INCOMPLETE > 0) {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "UserTrackbook information updated successfully...",
                                });
                            } else {
                                mm.executeDML(`SELECT ID FROM view_user_rewards where SUBSCRIPTION_DETAILS_ID = ? AND STATUS = "L" ORDER BY SEQ_NO ASC LIMIT 1 `, [bulkUpdateData[0].SUBSCRIPTION_DETAILS_ID], supportKey, connection, (error, resultsID) => {
                                    if (error) {
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to update userTrackbook information."
                                        });
                                    }
                                    else {
                                        if (resultsID[0]?.ID > 0) {
                                            mm.executeDML(`UPDATE user_rewards SET STATUS = "U" where ID = ? `, [resultsID[0]?.ID], supportKey, connection, (error, resultsUR) => {
                                                if (error) {
                                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                    console.log(error);
                                                    mm.rollbackConnection(connection);
                                                    res.send({
                                                        "code": 400,
                                                        "message": "Failed to update userTrackbook information."
                                                    });
                                                }
                                                else {
                                                    mm.sendNotificationToId(bulkUpdateData[0].USER_ID, "Reward Unlocked", "Congratulations! You've unlocked a new reward.", "RW", '', supportKey, (err, notification) => {
                                                        if (err) {
                                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                            console.log(error);
                                                            mm.rollbackConnection(connection);
                                                            res.send({
                                                                "code": 400,
                                                                "message": "Failed to update userTrackbook information."
                                                            });
                                                        }
                                                        else {
                                                            mm.commitConnection(connection);
                                                            res.send({
                                                                "code": 200,
                                                                "message": "UserTrackbook information updated successfully New Reward Unlocked...",
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        } else {
                                            mm.commitConnection(connection);
                                            res.send({
                                                "code": 200,
                                                "message": "UserTrackbook information updated successfully All Rewards Completed...",
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.getTaskCompletionSummary = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
    }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " GROUP BY DATE(ASSIGNED_DATE) order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY DATE(ASSIGNED_DATE) order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter + " GROUP BY DATE(ASSIGNED_DATE)";
    var supportKey = req.headers['supportkey'];

    try {
        mm.executeQuery('select count(*) as cnt from ' + viewUserTrackbook + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userTrackbooks count.",
                });
            }
            else {
                mm.executeQuery(`select DATE(ASSIGNED_DATE) DATE, COUNT(ID) TOTAL_ASSIGNED_TASKS, COUNT(IF(STATUS = 'D',1,NUll)) TOTAL_COMPLETED_TASKS, COUNT(IF(STATUS = 'U',1,NUll)) TOTAL_NOT_COMPLETED_TASKS, COUNT(IF(STATUS = 'N',1,NUll)) TOTAL_MISSED_TASKS from view_user_trackbook where 1 ` + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userTrackbook information."
                        });
                    }
                    else {
                        console.log("success", results);
                        res.send({
                            "code": 200,
                            "message": "success",
                            "count": results1.length,
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


exports.getUserTaskCompletionSummary = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
    }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " GROUP BY USER_ID,ASSIGNED_DATE order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY USER_ID,ASSIGNED_DATE order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter
    var supportKey = req.headers['supportkey'];

    try {
        mm.executeQuery('select count(DISTINCT USER_ID,ASSIGNED_DATE) as cnt from ' + viewUserTrackbook + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userTrackbooks count.",
                });
            }
            else {
                mm.executeQuery(`select USER_ID, ASSIGNED_DATE,USER_NAME, COUNT(ID) TOTAL_ASSIGNED_TASKS, COUNT(IF(STATUS = 'D',1,NUll)) TOTAL_COMPLETED_TASKS, COUNT(IF(STATUS = 'U',1,NUll)) TOTAL_NOT_COMPLETED_TASKS, COUNT(IF(STATUS = 'N',1,NUll)) TOTAL_MISSED_TASKS from view_user_trackbook where 1 ` + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userTrackbook information."
                        });
                    }
                    else {
                        console.log("success", results);
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


exports.getSummary = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
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
        mm.executeQuery('select count(*) as cnt from view_user_subscription WHERE 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityUserMappings count.",
                });
            }
            else {
                mm.executeQuery('SELECT USER_ID,USER_NAME,PURCHASE_DATE,(SELECT COUNT(ID) from view_user_trackbook WHERE USER_SUBSCRIPTION_ID = m.ID) AS NO_OF_TASK_SELECTED FROM view_user_subscription m WHERE 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityUserMapping information."
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