const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var userSubscription = "user_subscription";
var viewUserSubscription = "view_" + userSubscription;


function reqData(req) {

    var data = {
        USER_ID: req.body.USER_ID,
        SUBSCRIPTION_ID: req.body.SUBSCRIPTION_ID,
        PURCHASE_DATE: req.body.PURCHASE_DATE,
        EXPIRE_DATE: req.body.EXPIRE_DATE,
        PAID_AMOUNT: req.body.PAID_AMOUNT ? req.body.PAID_AMOUNT : 0,
        STATUS: req.body.STATUS ? '1' : '0',
        COUPON_ID: req.body.COUPON_ID,
        TRANSACTION_ID: req.body.TRANSACTION_ID,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}

exports.validate = function () {
    return [

        body('USER_ID').isInt().optional(), body('SUBSCRIPTION_ID').isInt().optional(), body('PURCHASE_DATE').optional(), body('EXPIRE_DATE').optional(), body('PAID_AMOUNT').isDecimal().optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewUserSubscription + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userSubscriptions count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewUserSubscription + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userSubscription information."
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
            mm.executeQueryData('INSERT INTO ' + userSubscription + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save userSubscription information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserSubscription information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + userSubscription + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update userSubscription information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "UserSubscription information updated successfully...",
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
    let subscriptionData = req.body.subscriptionData;

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
            // mm.executeDML('INSERT INTO ' + userSubscription + ' SET ?', data, supportKey, connection, (error, results) => {
            //     if (error) {
            //         console.log(error);
            //         logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            //         mm.rollbackConnection(connection);
            //         res.send({
            //             "code": 400,
            //             "message": "Failed to save userSubscription information..."
            //         });
            //     }
            //     else {
            mm.executeDML('INSERT INTO user_subscription_details (USER_SUBSCRIPTION_ID,START_DATE,END_DATE,IS_SUNDAY_OFF,STATUS,ANIMATION_ID,IS_CONTINUED,CLIENT_ID) VALUES(?,?,?,?,?,?,?,?)', [subscriptionData.USER_SUBSCRIPTION_ID, subscriptionData.START_DATE, subscriptionData.END_DATE, subscriptionData.IS_SUNDAY_OFF, 1, subscriptionData.ANIMATION_ID, subscriptionData.IS_CONTINUED == 1 ? 1 : 0, subscriptionData.CLIENT_ID], supportKey, connection, (error, results1) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to save usersubscriptiondetails information..."
                    });
                }
                else {
                    mm.executeDML('INSERT INTO user_animation_details (SUBSCRIPTION_DETAILS_ID, ANIMATION_DETAILS_ID,STATUS,CLIENT_ID) VALUES(?,?,?,?)', [results1.insertId, subscriptionData.ANIMATION_DETAILS_ID, subscriptionData.ANIMATION_STATUS, subscriptionData.CLIENT_ID], supportKey, connection, (error, results2) => {
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
                            mm.executeDML('SELECT ID FROM animation_rewards WHERE ANIMATION_DETAILS_ID = ?  AND STATUS = 1 ORDER BY SEQ_NO', [subscriptionData.ANIMATION_DETAILS_ID], supportKey, connection, (error, resultsR) => {
                                if (error) {
                                    console.log(error);
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to save rewards information..."
                                    });
                                }
                                else {
                                    if (resultsR.length > 0) {
                                        var recordData = []
                                        for (let i = 0; i < resultsR.length; i++) {
                                            const element = resultsR[i];
                                            let rec = [element.ID, 'L', subscriptionData.USER_SUBSCRIPTION_ID, data.CLIENT_ID];
                                            recordData.push(rec)
                                        }
                                        var inserQuery = `INSERT INTO user_rewards(REWARD_ID,STATUS,USER_ANIMATION_DETAIL_ID,CLIENT_ID) VALUES ?`
                                        mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, results3) => {
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
                                                    "message": "UserSubscription information saved successfully...",
                                                });
                                            }
                                        });
                                    } else {
                                        mm.commitConnection(connection);
                                        res.send({
                                            "code": 200,
                                            "message": "UserSubscription information saved successfully...",
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            });
            //     }
            // });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.getUserSubscriptionSummary = (req, res) => {

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
    // if (FROM_DATE && TO_DATE) {
    //     filter += " AND PURCHASE_DATE BETWEEN '" + FROM_DATE + "' AND '" + TO_DATE + "'";
    // }

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " GROUP BY SUBSCRIPTION_ID order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY SUBSCRIPTION_ID order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select count(DISTINCT SUBSCRIPTION_ID) as cnt from ' + viewUserSubscription + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get userSubscriptions count.",
                });
            }
            else {
                mm.executeQuery('SELECT SUBSCRIPTION_NAME, COUNT(ID) as NUMBER_OF_ACTIVE_USERS FROM view_user_subscription WHERE STATUS = 1  ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get userSubscription information."
                        });
                    }
                    else {
                        res.send({
                            "code": 200,
                            "message": "success",
                            "count": results1[0]?.cnt || 0,
                            "data": results
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Somthing went wrong..."
        })
    }
}


exports.getUserSubscriptionSummary111 = (req, res) => {

    let FROM_DATE = req.body.FROM_DATE ? req.body.FROM_DATE : '';
    let TO_DATE = req.body.TO_DATE ? req.body.TO_DATE : '';

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    criteria = filter + " order by " + sortKey + " " + sortValue;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`SELECT DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) AS DATE, (SELECT COUNT(ID) from user_subscription WHERE PURCHASE_DATE = DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) ) as COUNT FROM (SELECT @row := @row + 1 AS n FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30) AS t1,(SELECT @row := -1) AS t2) t WHERE DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) <= ${TO_DATE};`, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get student_master information."
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
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Somthing went wrong..."
        })
    }
}


exports.exit = (req, res) => {
    var supportKey = req.headers['supportkey'];
    var ID = req.body.ID
    var systemDate = mm.getSystemDate();

    try {
        mm.executeQueryData(`UPDATE user_subscription SET STATUS = 0, CREATED_MODIFIED_DATE = ? where ID = ? `, [systemDate, ID], supportKey, (error, results) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                res.send({
                    "code": 400,
                    "message": "Failed to update userSubscription information."
                });
            } else {
                mm.executeQueryData(`UPDATE user_subscription_details SET STATUS = 0, IS_TRACKBOOK_STARTED = 0, CREATED_MODIFIED_DATE = ? where USER_SUBSCRIPTION_ID = ? `, [systemDate, ID], supportKey, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        res.send({
                            "code": 400,
                            "message": "Failed to update userSubscription details."
                        });
                    } else {
                        res.send({
                            "code": 200,
                            "message": "UserSubscription information updated successfully...",
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Somthing went wrong..."
        })
    }
}