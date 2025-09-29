const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const Razorpay = require('razorpay');

const applicationkey = process.env.APPLICATION_KEY;

var subscriptionMaster = "subscription_master";
var viewSubscriptionMaster = "view_" + subscriptionMaster;


function reqData(req) {

    var data = {
        LABEL: req.body.LABEL,
        DESCRIPTION: req.body.DESCRIPTION,
        IS_TRACKBOOK_AVAILABLE: req.body.IS_TRACKBOOK_AVAILABLE ? '1' : '0',
        IS_QUESTION_PAPER_AVAILABLE: req.body.IS_QUESTION_PAPER_AVAILABLE ? '1' : '0',
        IS_ERP_AVAILBALE: req.body.IS_ERP_AVAILBALE ? '1' : '0',
        STATUS: req.body.STATUS ? '1' : '0',
        PRICE: req.body.PRICE ? req.body.PRICE : 0,
        DAYS: req.body.DAYS,
        DISCOUNT: req.body.DISCOUNT ? req.body.DISCOUNT : 0,
        TYPE: req.body.TYPE,
        DIAMENTION_ID: req.body.DIAMENTION_ID,
        AGE_GROUP: req.body.AGE_GROUP,
        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('LABEL').optional(), body('DESCRIPTION').optional(), body('PRICE').isDecimal().optional(), body('DAYS').isInt().optional(), body('DISCOUNT').isDecimal().optional(), body('TYPE').optional(), body('ID').optional(),

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
        mm.executeQuery('select count(*) as cnt from ' + viewSubscriptionMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get subscriptionMasters count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewSubscriptionMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get subscriptionMaster information."
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
            mm.executeQueryData('INSERT INTO ' + subscriptionMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save subscriptionMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "SubscriptionMaster information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + subscriptionMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update subscriptionMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "SubscriptionMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.generateOrderId = (req, res) => {
    let AMOUNT = req.body.AMOUNT ? req.body.AMOUNT : 0;
    var supportKey = req.headers['supportkey'];
    try {
        const KEY_ID = process.env.RAZOR_PAY_ID_KEY;
        const KEY_SECRET = process.env.RAZOR_PAY_SECRET_KEY;
        console.log(KEY_ID, KEY_SECRET);

        var instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
        instance.orders.create({
            "amount": AMOUNT,
            "currency": "INR",
            "receipt": "receipt#1",
            "partial_payment": false,
            "notes": {
                "key1": "value3",
                "key2": "value2"
            }
        })
            .then((order) => {
                console.log(order);
                res.send({
                    "code": 200,
                    "message": "success",
                    "data": order
                })
            })
            .catch((error) => {
                console.log(error);
                res.send({
                    "code": 400,
                    "message": "Failed to generate order ID.",
                })
            });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
        res.send({
            "code": 500,
            "message": "Something went wrong"
        });
    }
}

exports.sendSubscriptionMessage = (req, res) => {
    let MOBILE_NUMBER = req.body.MOBILE_NUMBER;
    let NAME = req.body.NAME;
    var supportKey = req.headers['supportkey'];

    try {
        var wparams = [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": "Shree"
                    },
                    {
                        "type": "text",
                        "text": "Collage Corner, Sangli - 416416"
                    },
                    {
                        "type": "text",
                        "text": "OFF20"
                    },
                    {
                        "type": "text",
                        "text": "20"
                    },
                ]
            }
        ]

        mm.sendWAToolSMS("91" + MOBILE_NUMBER, "upon_participation_challenge", wparams, 'en', (error, resultswsms) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to send OTP.",
                })
            }
            else {
                console.log(" whatsapp msg send : ", resultswsms)
                res.send({
                    "code": 200,
                    "message": "success",
                    "data": resultswsms
                })
            }
        })
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}
