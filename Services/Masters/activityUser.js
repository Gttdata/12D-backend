const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var activityUserMaster = "activity_user_master";
var viewActivityUserMaster = "view_" + activityUserMaster;


function reqData(req) {

    var data = {
        USER_ID: req.body.USER_ID,
        COMPLETED_PERCENTAGE: req.body.COMPLETED_PERCENTAGE ? req.body.COMPLETED_PERCENTAGE : 0,
        CURRENT_ACTIVITY_ID: req.body.CURRENT_ACTIVITY_ID,
        END_DATETIME: req.body.END_DATETIME,
        START_DATETIME: req.body.START_DATETIME,
        ACTIVITY_HEAD: req.body.ACTIVITY_HEAD,
        INTERMEDIATE_PERCENTAGE: req.body.INTERMEDIATE_PERCENTAGE ? req.body.INTERMEDIATE_PERCENTAGE : 0,
        ELITE_PERCENTAGE: req.body.ELITE_PERCENTAGE ? req.body.ELITE_PERCENTAGE : 0,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('USER_ID').isInt().optional(), body('COMPLETED_PERCENTAGE').isDecimal().optional(), body('CURRENT_ACTIVITY_ID').isInt().optional(), body('END_DATETIME').optional(), body('START_DATETIME').optional(), body('ID').optional(), body('ACTIVITY_HEAD').isInt().optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewActivityUserMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityUserMasters count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewActivityUserMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityUserMaster information."
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
            mm.executeQueryData('INSERT INTO ' + activityUserMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save activityUserMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityUserMaster information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + activityUserMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update activityUserMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityUserMaster information updated successfully...",
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

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];
    let activityId = req.body.activityId?.split(",");
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
            // mm.executeDML('SELECT GROUP_CONCAT(ACTIVITY_ID) AS IDS FROM activity_head_mapping WHERE HEAD_ID = ?', [data.ACTIVITY_HEAD], supportKey, connection, (error, resultsData) => {
            //     if (error) {
            //         logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            //         console.log(error);
            //         mm.rollbackConnection(connection);
            //         res.send({
            //             "code": 400,
            //             "message": "Failed to get view_activity_master information..."
            //         });
            //     }
            //     else {
            // activityId = resultsData[0]?.IDS?.split(",");
            if (activityId && activityId.length > 0) {
                mm.executeDML('INSERT INTO ' + activityUserMaster + ' SET ?', data, supportKey, connection, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to save activityUserMaster information..."
                        });
                    }
                    else {
                        var inserQuery = `INSERT INTO activity_user_mapping(MASTER_ID,ACTIVITY_MAPPING_ID,ACTIVITY_STATUS,CLIENT_ID) VALUES ?`
                        var recordData = []
                        for (let index = 0; index < activityId.length; index++) {
                            const activity = activityId[index];
                            var rec = [results.insertId, activity, "I", data.CLIENT_ID];
                            recordData.push(rec)
                        }
                        mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, resultAc) => {
                            if (error) {
                                console.log(error)
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey, supportKey, deviceid);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save activityUser information..."
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
            // }
            // });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}


exports.getPreArrengeActivity = (req, res) => {

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
        criteria = filter + " GROUP BY ACTIVITY_HEAD order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY ACTIVITY_HEAD order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select count(DISTINCT ACTIVITY_HEAD) as cnt from view_activity_user_master where HEAD_USER_ID = 0 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityUserMappings count.",
                });
            }
            else {
                mm.executeQuery('SELECT ACTIVITY_HEAD,HEAD_NAME,COUNT(IF(START_DATETIME <> null,1,null)) AS NUMBER_OF_USER,COUNT(IF(END_DATETIME <> null,1,null))AS NUMBER_OF_USER_COMPLETED from view_activity_user_master where HEAD_USER_ID = 0 ' + criteria, supportKey, (error, results) => {
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