const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async');

const applicationkey = process.env.APPLICATION_KEY;

var userQuestionaries = "user_questionaries";
var viewUserQuestionaries = "view_" + userQuestionaries;


function reqData(req) {

    var data = {
        USER_ID: req.body.USER_ID,
        QUESTION_ID: req.body.QUESTION_ID,
        OPTION_ID: req.body.OPTION_ID,
        ANSWER_TEXT: req.body.ANSWER_TEXT,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('USER_ID').isInt().optional(), body('QUESTION_ID').isInt().optional(), body('OPTION_ID').isInt().optional(), body('ANSWER_TEXT').optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewUserQuestionaries + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userQuestionaries count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewUserQuestionaries + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userQuestionaries information."
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
            mm.executeQueryData('INSERT INTO ' + userQuestionaries + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save userQuestionaries information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserQuestionaries information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + userQuestionaries + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userQuestionaries information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserQuestionaries information updated successfully...",
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
    let QUESTION_DATA = req.body.QUESTION_DATA;

    try {
        if (QUESTION_DATA && QUESTION_DATA.length > 0) {
            async.eachSeries(QUESTION_DATA, function iteratorOverElems(element, callback) {
                // let data = reqData(element)
                mm.executeQueryData('INSERT INTO ' + userQuestionaries + ' SET ?', element, supportKey, (error, results) => {
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
                        "message": "Failed to save userQuestionaries information..."
                    });
                } else {
                    res.send({
                        "code": 200,
                        "message": "UserQuestionaries information saved successfully...",
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