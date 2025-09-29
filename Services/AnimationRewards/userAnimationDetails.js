const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var userAnimationDetails = "user_animation_details";
var viewUserAnimationDetails = "view_" + userAnimationDetails;


function reqData(req) {

    var data = {
        SUBSCRIPTION_DETAILS_ID: req.body.SUBSCRIPTION_DETAILS_ID,
        ANIMATION_DETAILS_ID: req.body.ANIMATION_DETAILS_ID,
        STATUS: req.body.STATUS ? '1' : '0',

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('SUBSCRIPTION_DETAILS_ID').isInt().optional(), body('ANIMATION_DETAILS_ID').isInt().optional(), body('STATUS').optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewUserAnimationDetails + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userAnimationDetails count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewUserAnimationDetails + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userAnimationDetails information."
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
            mm.executeQueryData('INSERT INTO ' + userAnimationDetails + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save userAnimationDetails information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserAnimationDetails information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + userAnimationDetails + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userAnimationDetails information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserAnimationDetails information updated successfully...",
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.addRewards = (req, res) => {

    var supportKey = req.headers['supportkey'];
    let USER_ID = req.body.USER_ID
    let PREVIOUS_SEQ = req.body.PREVIOUS_SEQ

    try {
        const connection = mm.openConnection();
        mm.executeDML('SELECT ID,ANIMATION_ID FROM view_user_subscription_details WHERE USER_ID = ? AND CURRENT_DATE BETWEEN START_DATE AND END_DATE AND STATUS = 1;', [USER_ID], supportKey, connection, (error, resultsSD) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                mm.rollbackConnection(connection);
                res.send({
                    "code": 400,
                    "message": "Failed to get userDetails..."
                });
            }
            else {
                mm.executeDML('SELECT ID from animation_details WHERE SEQ_NO = ? AND ANIMATION_ID = ?', [PREVIOUS_SEQ + 1, resultsSD[0]?.ANIMATION_ID], supportKey, connection, (error, resultsAD) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to get animation information..."
                        });
                    }
                    else {
                        mm.executeDML('SELECT ID from animation_rewards WHERE STATUS = 1 AND ANIMATION_DETAILS_ID = ?', [resultsAD[0]?.ID], supportKey, connection, (error, resultsR) => {
                            if (error) {
                                console.log(error);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get reward information..."
                                });
                            }
                            else {
                                mm.executeDML('INSERT INTO user_animation_details (ANIMATION_DETAILS_ID,SUBSCRIPTION_DETAILS_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?) ', [resultsAD[0]?.ID, resultsSD[0]?.ID, 1, 1], supportKey, connection, (error, results) => {
                                    if (error) {
                                        console.log(error);
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to save userAnimationDetails information..."
                                        });
                                    }
                                    else {
                                        var recordData = []
                                        for (let index = 0; index < resultsR.length; index++) {
                                            var rec = [resultsR[index].ID, results.insertId, "L", 1];
                                            recordData.push(rec)
                                        }
                                        mm.executeDML('INSERT INTO user_rewards (REWARD_ID,USER_ANIMATION_DETAIL_ID,STATUS,CLIENT_ID) VALUES ? ', [recordData], supportKey, connection, (error, results) => {
                                            if (error) {
                                                console.log(error);
                                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                mm.rollbackConnection(connection);
                                                res.send({
                                                    "code": 400,
                                                    "message": "Failed to save userAnimationDetails information..."
                                                });
                                            }
                                            else {
                                                mm.commitConnection(connection);
                                                res.send({
                                                    "code": 200,
                                                    "message": "UserAnimationDetails information saved successfully...",
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}