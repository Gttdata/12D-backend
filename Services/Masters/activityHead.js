const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var activityHeadMaster = "activity_head_master";
var viewActivityHeadMaster = "view_" + activityHeadMaster;


function reqData(req) {

    var data = {
        HEAD_NAME: req.body.HEAD_NAME,
        HEAD_IMAGE: req.body.HEAD_IMAGE,
        SEQ_NO: req.body.SEQ_NO,
        STATUS: req.body.STATUS ? '1' : '0',
        USER_ID: req.body.USER_ID,

        CLIENT_ID: req.body.CLIENT_ID,
        REST_TIME: req.body.REST_TIME,

    }
    return data;
}

exports.validate = function () {
    return [

        body('HEAD_NAME').optional(), body('HEAD_IMAGE').optional(), body('SEQ_NO').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewActivityHeadMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityHeadMaster count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewActivityHeadMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityHeadMaster information."
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
            mm.executeQueryData('INSERT INTO ' + activityHeadMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save activityHeadMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityHeadMaster information saved successfully...",
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
            if (data.HEAD_IMAGE == "" || data.HEAD_IMAGE == null) {
                setData += ` HEAD_IMAGE = ? ,`
                recordData.push('')
            }
            mm.executeQueryData(`UPDATE ` + activityHeadMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update activityHeadMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityHeadMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.addUserHead = (req, res) => {

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];
    let activityId = req.body.activityId

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
            if (activityId && activityId.length > 0) {
                mm.executeDML('INSERT INTO ' + activityHeadMaster + ' SET ?', data, supportKey, connection, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to save activityHeadMaster information..."
                        });
                    }
                    else {
                        var inserQuery = `INSERT INTO activity_head_mapping(HEAD_ID,ACTIVITY_ID,ACTIVITY_TYPE,ACTIVITY_VALUE,CLIENT_ID) VALUES ?`
                        var recordData = []
                        for (let index = 0; index < activityId.length; index++) {
                            const activity = activityId[index];
                            var rec = [results.insertId, activity.ACTIVITY_ID, activity.ACTIVITY_TYPE, activity.ACTIVITY_VALUE, data.CLIENT_ID];
                            recordData.push(rec)
                        }
                        mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, resultAc) => {
                            if (error) {
                                console.log(error)
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey, supportKey, deviceid);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save activityMapping information..."
                                });
                            }
                            else {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "activityUser information saved successfully...",
                                    "MASTER_ID": results.insertId
                                });
                            }
                        });
                    }
                });
            }
            else {
                mm.rollbackConnection(connection);
                res.send({
                    "code": 300,
                    "message": "no activity found...",
                });
            }
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.updateUserHead = (req, res) => {
    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    let activityId = req.body.activityId


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
            const connection = mm.openConnection()
            if (activityId && activityId.length > 0) {
                let deleteQuery = ``
                let inserQuery = `INSERT INTO activity_head_mapping(HEAD_ID,ACTIVITY_ID,ACTIVITY_TYPE,ACTIVITY_VALUE,CLIENT_ID) VALUES ?`
                let recordData = []
                for (let index = 0; index < activityId.length; index++) {
                    const activity = activityId[index];

                    deleteQuery += `DELETE FROM activity_head_mapping WHERE ID = ${activity.ID} AND HEAD_ID = ${activity.HEAD_ID} AND ACTIVITY_ID = ${activity.ACTIVITY_ID};`
                    if (activity.IS_DELETE == false) {
                        let rec = [activity.HEAD_ID, activity.ACTIVITY_ID, activity.ACTIVITY_TYPE, activity.ACTIVITY_VALUE, 1];
                        recordData.push(rec)
                    }
          
                }
                if (deleteQuery.length > 0) {
                    mm.executeDML(deleteQuery, [], supportKey, connection, (error, resultAcc) => {
                        if (error) {
                            console.log(error)
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey, supportKey, deviceid);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to delete activityMapping information..."
                            });
                        }
                        else {
                            if (recordData.length > 0) {
                                mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, resultAc) => {
                                    if (error) {
                                        console.log(error)
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey, supportKey, deviceid);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to update activityMapping information..."
                                        });
                                    }
                                    else {
                                        mm.commitConnection(connection);
                                        res.send({
                                            "code": 200,
                                            "message": "activityUser information updated successfully...",
                                        });
                                    }
                                });
                            }else{
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "activityId array is empty...",
                                });
                            }

                        
                        }
                    });
                } else {
                    mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, resultAc) => {
                        if (error) {
                            console.log(error)
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey, supportKey, deviceid);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to update activityMapping information..."
                            });
                        }
                        else {
                            mm.commitConnection(connection);
                            res.send({
                                "code": 200,
                                "message": "activityUser information updated successfully...",
                            });
                        }
                    });
                }

            }
            else {
                mm.rollbackConnection(connection);
                res.send({
                    "code": 300,
                    "message": "no activity found...",
                });
            }
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.getCustomWorkOutReports = (req, res) => {

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
        mm.executeQuery('select count(*) as cnt from ' + viewActivityHeadMaster + ' where 1  AND USER_ID <> 0 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityHeadMaster count.",
                });
            }
            else {
                mm.executeQuery('select USER_NAME,HEAD_NAME,CREATED_MODIFIED_DATE, (SELECT COUNT(ID) from activity_head_mapping a where a.HEAD_ID = view_activity_head_master.ID) NUMBER_OF_ACTIVITIES from view_activity_head_master where 1 AND USER_ID <> 0 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityHeadMaster information."
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


exports.getCustomWorkOutSummary = (req, res) => {

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
        criteria = filter + " GROUP BY USER_ID order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY USER_ID order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select count(DISTINCT USER_ID) as cnt from ' + viewActivityHeadMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityHeadMaster count.",
                });
            }
            else {
                mm.executeQuery('select USER_NAME,USER_ID,COUNT(ID) NUMBER_OF_ACTIVITIES from view_activity_head_master  where 1 AND USER_ID <> 0  ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityHeadMaster information."
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
