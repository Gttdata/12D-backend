const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async');

const applicationkey = process.env.APPLICATION_KEY;

var memberTodo = "member_todo";
var viewMemberTodo = "view_" + memberTodo;


function reqData(req) {

    var data = {
        MEMBER_ID: req.body.MEMBER_ID,
        CREATED_DATETIME: req.body.CREATED_DATETIME,
        TITLE: req.body.TITLE,
        DESCRIPTION: req.body.DESCRIPTION,
        IS_REMIND: req.body.IS_REMIND ? '1' : '0',
        REMIND_DATETIME: req.body.REMIND_DATETIME,
        REMIND_TYPE: req.body.REMIND_TYPE,
        IS_COMPLETED: req.body.IS_COMPLETED ? '1' : '0',
        STATUS: req.body.STATUS ? '1' : '0',
        TYPE: req.body.TYPE,
        GROUP_NO: req.body.GROUP_NO,
        COLOR_TAG: req.body.COLOR_TAG,
        CLIENT_ID: req.body.CLIENT_ID,
        IS_FULL_WEEK: req.body.IS_FULL_WEEK ? '1' : '0',
        IS_SUB_TASK: req.body.IS_SUB_TASK ? '1' : '0',

    }
    return data;
}



exports.validate = function () {
    return [

        body('MEMBER_ID').isInt().optional(), body('CREATED_DATETIME').optional(), body('TITLE').optional(), body('DESCRIPTION').optional(), body('REMIND_DATETIME').optional(), body('REMIND_TYPE').optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewMemberTodo + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get memberTodos count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewMemberTodo + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get memberTodo information."
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
            mm.executeQueryData('INSERT INTO ' + memberTodo + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save memberTodo information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "MemberTodo information saved successfully...",
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
        data[key] !=null ? setData += `${key}= ? , ` : true;
        data[key] !=null ? recordData.push(data[key]) : true;
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
            mm.executeQueryData(`UPDATE ` + memberTodo + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update memberTodo information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "MemberTodo information updated successfully...",
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
    let WEEK_PLAN_DATES = req.body.WEEK_PLAN_DATES ? req.body.WEEK_PLAN_DATES : '';
    let REMIND_TIME = req.body.REMIND_TIME ? req.body.REMIND_TIME : '';

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQuery('SELECT DISTINCT(GROUP_NO) GROUP_NO from member_todo ORDER BY GROUP_NO DESC LIMIT 1', supportKey, (error, results1) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to get memberTodos count.",
                    });
                }
                else {
                    data.GROUP_NO = results1[0]?.GROUP_NO + 1 || 1
                    async.eachSeries(WEEK_PLAN_DATES, function iteratorOverElems(element, callback) {
                        data.CREATED_DATETIME = element
                        data.REMIND_DATETIME = element.split(' ')[0] + ' ' + REMIND_TIME
                        mm.executeQueryData('INSERT INTO ' + memberTodo + ' SET ?', data, supportKey, (error, results) => {
                            if (error) {
                                callback(error)
                            }
                            else {
                                callback()
                            }
                        });
                    }, function subCb(error) {
                        if (error) {
                            console.log(error);
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            res.send({
                                "code": 400,
                                "message": "Failed to save memberTodo information..."
                            });
                        } else {
                            res.send({
                                "code": 200,
                                "message": "MemberTodo information saved successfully...",
                            });
                        }
                    });
                }
            })
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.updateSeries = (req, res) => {

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];
    let WEEK_PLAN_DATES = req.body.WEEK_PLAN_DATES ? req.body.WEEK_PLAN_DATES : '';
    let REMIND_TIME = req.body.REMIND_TIME ? req.body.REMIND_TIME : '';

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
            mm.executeDML('DELETE FROM member_todo where GROUP_NO = ?', [data.GROUP_NO], supportKey, connection, (error, results1) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to get memberTodos count.",
                    });
                }
                else {
                    async.eachSeries(WEEK_PLAN_DATES, function iteratorOverElems(element, callback) {
                        data.CREATED_DATETIME = element
                        data.REMIND_DATETIME = element.split(' ')[0] + ' ' + REMIND_TIME
                        mm.executeDML('INSERT INTO ' + memberTodo + ' SET ?', data, supportKey, connection, (error, results) => {
                            if (error) {
                                callback(error)
                            }
                            else {
                                callback()
                            }
                        });
                    }, function subCb(error) {
                        if (error) {
                            console.log(error);
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to save memberTodo information..."
                            });
                        } else {
                            mm.commitConnection(connection);
                            res.send({
                                "code": 200,
                                "message": "MemberTodo information saved successfully...",
                            });
                        }
                    });
                }
            })
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.remove = (req, res) => {
    var supportKey = req.headers['supportkey'];
    var systemDate = mm.getSystemDate();
    let IDS = req.body.IDS ? req.body.IDS : [0];

    try {
        mm.executeQueryData(`UPDATE ` + memberTodo + ` SET STATUS = 0 where ID IN (${IDS})`, '', supportKey, (error, results) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                res.send({
                    "code": 400,
                    "message": "Failed to update memberTodo information."
                });
            }
            else {
                res.send({
                    "code": 200,
                    "message": "MemberTodo information updated successfully...",
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }
}