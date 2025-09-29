const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const { select } = require('async');

const applicationkey = process.env.APPLICATION_KEY;

var studentFeeMaster = "student_fee_master";
var viewStudentFeeMaster = "view_" + studentFeeMaster;


function reqData(req) {

    var data = {
        STUDENT_ID: req.body.STUDENT_ID,
        YEAR_ID: req.body.YEAR_ID,
        CLASS_ID: req.body.CLASS_ID,
        DIVISION_ID: req.body.DIVISION_ID,
        PENDING_FEE: req.body.PENDING_FEE ? req.body.PENDING_FEE : 0,
        TOTAL_FEE: req.body.TOTAL_FEE ? req.body.TOTAL_FEE : 0,
        PAID_FEE: req.body.PAID_FEE ? req.body.PAID_FEE : 0,
        DISCOUNT_AMOUNT: req.body.DISCOUNT_AMOUNT ? req.body.DISCOUNT_AMOUNT : 0,
        DISCOUNT_TYPE: req.body.DISCOUNT_TYPE,
        DISCOUNT_VALUE: req.body.DISCOUNT_VALUE ? req.body.DISCOUNT_VALUE : 0,
        IS_DISCOUNT_AVAILABLE: req.body.IS_DISCOUNT_AVAILABLE ? "1" : "0",

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('STUDENT_ID').isInt().optional(), body('YEAR_ID').isInt().optional(), body('CLASS _ID').isInt().optional(), body('DIVISION_ID').isInt().optional(), body('PENDING_FEE').isDecimal().optional(), body('TOTAL_FEE').isDecimal().optional(), body('PAID_FEE').isDecimal().optional(), body('DISCOUNT_AMOUNT').isDecimal().optional(), body('DISCOUNT_TYPE').optional(), body('DISCOUNT_VALUE').isDecimal().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewStudentFeeMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get studentFeeMasters count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewStudentFeeMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get studentFeeMaster information."
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
        //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
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
            mm.executeQueryData('INSERT INTO ' + studentFeeMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save studentFeeMaster information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "StudentFeeMaster information saved successfully...",
                    });
                }
            });
        } catch (error) {
            //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
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
            mm.executeQueryData(`UPDATE ` + studentFeeMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update studentFeeMaster information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "StudentFeeMaster information updated successfully...",
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

exports.addBulk = (req, res) => {

    var supportKey = req.headers['supportkey'];

    var feeDetails = req.body.feeDetails
    var CLASS_ID = req.body.CLASS_ID
    var YEAR_ID = req.body.YEAR_ID
    var STUDENT_ID = req.body.STUDENT_ID;
    var DIVISION_ID = req.body.DIVISION_ID;
    var ID = req.body.ID;

    var data = reqData(req);

    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });

    try {
        if (feeDetails.length > 0) {
            const connection = mm.openConnection();
            var query = ''
            var insertData = []
            var key = 0
            if (ID != 0 && ID != null && ID != '' && ID != undefined) {
                query = `UPDATE ` + studentFeeMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${ID} `
                insertData = recordData
            } else {
                query = 'INSERT INTO ' + studentFeeMaster + ' SET ?'
                insertData = data
                key = 1
            }

            mm.executeDML(query, insertData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to create student_fee_details information."
                    });
                }
                else {
                    if (key == 1) {
                        ID = results.insertId
                    }
                    var recData = [];
                    for (let i = 0; i < feeDetails.length; i++) {
                        var element = feeDetails[i]
                        var rec = [ID, element.TOTAL_FEE, element.PAID_FEE, element.PENDING_FEE, 1, 1, element.HEAD_ID]
                        recData.push(rec)
                    }
                    mm.executeDML(`DELETE FROM student_fee_details where FEE_MASTER_ID = ?;`, [ID], supportKey, connection, (error, results1) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to create student_fee_details information."
                            });
                        }
                        else {
                            mm.executeDML(`INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,CLIENT_ID,STATUS,HEAD_ID ) values ?`, [recData], supportKey, connection, (error, results2) => {
                                if (error) {
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to create student_fee_details information."
                                    });
                                }
                                else {
                                    mm.commitConnection(connection);
                                    res.send({
                                        "code": 200,
                                        "message": "studentFeeDetails information updated successfully...",
                                    });
                                }
                            });
                        }
                    });
                }
            })
        } else {
            res.send({
                "code": 300,
                "message": "Please provide fee details...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}

exports.sendFeeDuesNotification = (req, res) => {
    const studentIds = req.body.STUDENT_IDs || 0;
    const yearId = req.body.YEAR_ID || 0;
    const supportKey = req.headers['supportkey'];
    try {
        mm.executeQueryData('SELECT STUDENT_ID, STUDENT_NAME,PENDING_FEE FROM view_student_fee_master where STUDENT_ID IN (?) AND PENDING_FEE > 0 AND YEAR_ID = ?', [studentIds, yearId], supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Something went wrong"
                })
            }
            else {
                if (!results || results.length == 0) {
                    res.send({
                        "code": 300,
                        "message": "No data found"
                    })
                } else {
                    results.forEach(element => {
                        var TITLE = `Gentle Reminder!`
                        var DESCRIPTION = `Dear ${element.STUDENT_NAME},
                
                        Your fee payment of Rs. ${element.PENDING_FEE} is pending. Please complete it as early as possible.`

                        mm.sendNotificationToId(element.STUDENT_ID, TITLE, DESCRIPTION, "", "", supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + element.STUDENT_ID);
                            }
                        })
                    });

                    res.send({
                        "code": 200,
                        "message": "Notification sent successfully"
                    })
                }
            }
        })

    } catch (error) {
        console.log(error);
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        res.send({
            "code": 400,
            "message": "Something went wrong"
        })
    }
}

exports.delete = (req, res) => {
    let ID = req.body.ID || 0;
    let supportKey = req.headers['supportkey'];
    try {
        mm.executeQueryData('DELETE FROM ' + studentFeeMaster + ' where ID = ?', [ID], supportKey, (error, results) => {
            if (error) {
                console.log(error);
                //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to delete studentFeeMaster information..."
                });
            }
            else {
                console.log(results);
                res.send({
                    "code": 200,
                    "message": "StudentFeeMaster information deleted successfully...",
                });
            }
        });
    } catch (error) {
        //logger.error('APIK:' + req.headers['apikey'] +' '+supportKey+ ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}
