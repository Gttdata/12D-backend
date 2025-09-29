const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async');

const applicationkey = process.env.APPLICATION_KEY;

var questionaryMaster = "questionary_master";
var viewQuestionaryMaster = "view_" + questionaryMaster;


function reqData(req) {

    var data = {
        AGE_GROUP: req.body.AGE_GROUP,
        DIAMENTION_ID: req.body.DIAMENTION_ID,
        QUESTION_HEAD_ID: req.body.QUESTION_HEAD_ID,
        LABEL: req.body.LABEL,
        DESCRIPTION: req.body.DESCRIPTION,
        IS_COMMON: req.body.IS_COMMON ? '1' : '0',
        IS_CHILD_AVAILABLE: req.body.IS_CHILD_AVAILABLE ? '1' : '0',
        QUESTION_TYPE: req.body.QUESTION_TYPE,
        STATUS: req.body.STATUS ? '1' : '0',
        SEQ_NO: req.body.SEQ_NO,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('AGE_GROUP').isInt().optional(), body('DIAMENTION_ID').isInt().optional(), body('QUESTION_HEAD_ID').isInt().optional(), body('LABEL').optional(), body('DESCRIPTION').optional(), body('QUESTION_TYPE').isInt(), body('SEQ_NO').isInt().optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewQuestionaryMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get questionaryMasters count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewQuestionaryMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get questionaryMaster information."
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
            mm.executeQueryData('INSERT INTO ' + questionaryMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save questionaryMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "QuestionaryMaster information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + questionaryMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update questionaryMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "QuestionaryMaster information updated successfully...",
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
    let OPTIONS = req.body.OPTIONS;

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
            mm.executeDML('INSERT INTO ' + questionaryMaster + ' SET ?', data, supportKey, connection, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to save questionaryMaster information..."
                    });
                }
                else {
                    if (OPTIONS?.length > 0) {
                        async.eachSeries(OPTIONS, function iteratorOverElems(element, callback) {
                            mm.executeDML('INSERT INTO questionary_options (QUESTION_ID,LABEL,RANGES,STATUS,CLIENT_ID) VALUES(?,?,?,?,?)', [results.insertId, element.LABEL, element.RANGES, element.STATUS, data.CLIENT_ID], supportKey, connection, (error, results1) => {
                                if (error) {
                                    callback(error);
                                }
                                else {
                                    var inserQuery = `INSERT INTO option_task_mapping(OPTION_ID,TASK_ID,DATE_DIFFERENCE,ENABLE_TIME,DISABLE_TIME,CLIENT_ID) VALUES ?`
                                    var recordData = []
                                    for (let index = 0; index < element.TASKS?.length; index++) {
                                        const task = element.TASKS[index];
                                        var rec = [results1.insertId, task.TASK_ID, task.DATE_DIFFERENCE, task.ENABLE_TIME, task.DISABLE_TIME, data.CLIENT_ID];
                                        recordData.push(rec)
                                    }
                                    mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, results2) => {
                                        if (error) {
                                            callback(error);
                                        }
                                        else {
                                            callback();
                                        }
                                    })
                                }
                            })
                        }, function subCb(error) {
                            if (error) {
                                console.log(error);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save questionaryMaster information..."
                                });
                            } else {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "QuestionaryMaster information saved successfully...",
                                });
                            }
                        });
                    } else {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "QuestionaryMaster information saved successfully...",
                        });
                    }
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.getData = (req, res) => {

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
        mm.executeQuery('select count(*) as cnt from ' + viewQuestionaryMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get questionaryMasters count.",
                });
            }
            else {
                mm.executeQuery(`SELECT *,(SELECT JSON_ARRAYAGG(JSON_OBJECT('ID',ID,'LABLE',LABEL,'RANGES',RANGES )) FROM questionary_options WHERE QUESTION_ID = m.ID AND STATUS = 1)AS QU_OPTIONS from questionary_master m where 1 ` + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get questionaryMaster information."
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