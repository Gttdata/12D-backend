const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var ticketGroupMaster = "ticket_group_master";
var viewTicketGroupMaster = "view_" + ticketGroupMaster;

function reqData(req) {
    var data = {
        PARENT_ID: req.body.PARENT_ID,
        TYPE: req.body.TYPE,
        VALUE: req.body.VALUE,
        URL: req.body.URL,
        SEQ_NO: req.body.SEQ_NO,
        IS_LAST: req.body.IS_LAST ? '1' : '0',
        ALERT_MSG: req.body.ALERT_MSG,
        STATUS: req.body.STATUS ? '1' : '0',
        PRIORITY: req.body.PRIORITY,
        DEPARTMENT_ID: req.body.DEPARTMENT_ID,
        CLIENT_ID: req.body.CLIENT_ID,
        ORG_ID: req.body.ORG_ID,
        IMAGE_URL: req.body.IMAGE_URL,
        DESCRIPTION: req.body.DESCRIPTION,
        TASK_ASSIGN_TYPE: req.body.TASK_ASSIGN_TYPE,
        TASK_ASSIGN_DAYS: req.body.TASK_ASSIGN_DAYS

    }
    return data;
}

exports.validate = function () {
    return [
        body('PARENT_ID').isInt(),
        body('TYPE', ' parameter missing').exists(),
        body('VALUE', ' parameter missing').exists(),
        // body('URL', ' parameter missing').exists(),
        body('SEQ_NO').isInt(),
        // body('ALERT_MSG', ' parameter missing').exists(),
        // body('PRIORITY', ' parameter missing').exists(),
        // body('DEPARTMENT_ID').isInt(),
        body('ID').optional(),
    ]
}

exports.get = (req, res) => {
    try {
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
            mm.executeQuery('select count(*) as cnt from ' + viewTicketGroupMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to get ticketGroups count...",
                    });
                }
                else {
                    console.log(results1);
                    mm.executeQuery('select * from ' + viewTicketGroupMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                        if (error) {
                            console.log(error);
                            //logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            res.send({
                                "code": 400,
                                "message": "Failed to get ticketGroup information..."
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
            //  logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
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
            mm.executeQueryData('INSERT INTO ' + ticketGroupMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    //logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save ticketGroup information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "TicketGroup information saved successfully...",
                    });
                }
            });
        } catch (error) {
            // logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
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
        //data[key] ? setData += `${key}= '${data[key]}', ` : true;
        //setData += `${key}= :"${key}", `;
        setData += `${key}= ? , `;
        recordData.push(data[key]);
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
            mm.executeQueryData(`UPDATE ` + ticketGroupMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update ticketGroup information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "TicketGroup information updated successfully...",
                    });
                }
            });
        } catch (error) {
            //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.getParent = (req, res) => {

    var TICKET_GROUP_ID = req.body.TICKET_GROUP_ID;

    var supportKey = req.headers['supportkey'];
    try {
        // mm.executeQueryData(`SELECT @r AS TICKET_GROUP_ID, VALUE, (SELECT @r := parent_id FROM ticket_group_master WHERE id = TICKET_GROUP_ID) AS parent_id FROM (SELECT @r := ?, @l := 0) val, ticket_group_master WHERE @r <> 0`, TICKET_GROUP_ID, supportKey, (error, results) => {
        mm.executeQueryData(`SELECT T2.id, T2.VALUE,t2.PARENT_ID FROM (SELECT @r AS _id, (SELECT @r := parent_id FROM ticket_group_master WHERE id = _id) AS parent_id, @l := @l + 1 AS lvl FROM (SELECT @r := ?, @l := 0) vars, ticket_group_master m WHERE @r <> 0) T1 JOIN ticket_group_master T2 ON T1._id = T2.id ORDER BY T1.lvl DESC`, TICKET_GROUP_ID, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get ticketGroup information..."
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
        //  logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }
}


