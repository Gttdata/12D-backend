const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const xlsx = require("xlsx");
const async = require('async')
const jwt = require('jsonwebtoken');

const applicationkey = process.env.APPLICATION_KEY;

var appUserMaster = "app_user_master";
var viewAppUserMaster = "view_" + appUserMaster;


function reqData(req) {

    var data = {
        NAME: req.body.NAME,
        COUNTRY_ID: req.body.COUNTRY_ID,
        STATE_ID: req.body.STATE_ID,
        CITY_ID: req.body.CITY_ID,
        ADDRESS: req.body.ADDRESS,
        DOB: req.body.DOB,
        GENDER: req.body.GENDER,
        IDENTITY_NUMBER: req.body.IDENTITY_NUMBER,
        MOBILE_NUMBER: req.body.MOBILE_NUMBER,
        EMAIL_ID: req.body.EMAIL_ID,
        PASSWORD: req.body.PASSWORD,
        STATUS: req.body.STATUS ? 1 : 0,
        DISTRICT_ID: req.body.DISTRICT_ID,
        ROLE: req.body.ROLE,
        SCHOOL_ID: req.body.SCHOOL_ID,
        IS_VERIFIED: req.body.IS_VERIFIED ? 1 : 0,
        PROFILE_PHOTO: req.body.PROFILE_PHOTO,
        COUNTRY_NAME: req.body.COUNTRY_NAME,
        STATE_NAME: req.body.STATE_NAME,
        DISTRICT_NAME: req.body.DISTRICT_NAME,
        APPROVAL_STATUS: req.body.APPROVAL_STATUS,
        REJECT_BLOCKED_REMARK: req.body.REJECT_BLOCKED_REMARK,
        TEMP_CLASS_ID: req.body.TEMP_CLASS_ID,
        TEMP_DIVISION_ID: req.body.TEMP_DIVISION_ID,
        TEMP_MEDIUM_ID: req.body.TEMP_MEDIUM_ID,
        TEMP_ROLL_NO: req.body.TEMP_ROLL_NO,
        TEMP_SUBJECT_ID: req.body.TEMP_SUBJECT_ID,
        PINCODE: req.body.PINCODE,
        CLOUD_ID: req.body.CLOUD_ID,
        IS_REGISTERED: req.body.IS_REGISTERED ? 1 : 0,
        DEVICE_NAME: req.body.DEVICE_NAME,
        ANDROID_VERSION: req.body.ANDROID_VERSION,
        LAST_VISIT_DATETIME: req.body.LAST_VISIT_DATETIME,
        APP_VERSION: req.body.APP_VERSIONF,
        AGE: req.body.AGE,
        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('NAME').optional(), body('COUNTRY_ID').optional(), body('STATE_ID').optional(), body('CITY_ID').optional(), body('ADDRESS').optional(), body('DOB').optional(), body('GENDER').optional(), body('IDENTITY_NUMBER').optional(), body('MOBILE_NUMBER').optional(), body('EMAIL_ID').optional(), body('PASSWORD').optional(), body('DISTRICT_ID').optional(), body('ROLE').optional(), body('SCHOOL_ID').isInt().optional(), body('PROFILE_PHOTO').optional(), body('COUNTRY_NAME').optional(), body('STATE_NAME').optional(), body('DISTRICT_NAME').optional(), body('APPROVAL_STATUS').optional(), body('REJECT_BLOCKED_REMARK').optional(), body('TEMP_CLASS_ID').optional(), body('TEMP_DIVISION_ID').optional(), body('TEMP_MEDIUM_ID').optional(), body('TEMP_ROLL_NO').optional(), body('TEMP_SUBJECT_ID').optional(), body('PINCODE').optional(), body('CLOUD_ID').optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewAppUserMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get appUserMasters count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewAppUserMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get appUserMaster information."
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
            mm.executeQueryData('INSERT INTO ' + appUserMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save appUserMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "AppUserMaster information saved successfully...",
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
            if (data.IDENTITY_NUMBER == "" || data.IDENTITY_NUMBER == null) {
                setData += ` IDENTITY_NUMBER = ? ,`
                recordData.push('')
            }
            if (data.PROFILE_PHOTO == "" || data.PROFILE_PHOTO == null) {
                setData += ` PROFILE_PHOTO = ? ,`
                recordData.push('')
            }
            if (data.APPROVAL_STATUS == 'A') {
                setData += ` REJECT_BLOCKED_REMARK = ? ,`
                recordData.push(null)
            }
            if (data.STATUS == 0) {
                setData += ` STATUS = ? ,`
                recordData.push(0)
            }
            mm.executeQueryData(`UPDATE ` + appUserMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update appUserMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "AppUserMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

//open
exports.register = (req, res) => {

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];
    var MOBILE_NUMBER = req.body.MOBILE_NUMBER
    let IS_NEW_USER = req.body.IS_NEW_USER ? req.body.IS_NEW_USER : 0
    const systemDate = mm.getSystemDate();
    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            if (IS_NEW_USER == 1) {
                mm.executeQueryData(`UPDATE app_user_master SET IS_REGISTERED = 1 ,CREATED_MODIFIED_DATE = '${systemDate}' where MOBILE_NUMBER = ? `, [MOBILE_NUMBER], supportKey, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        res.send({
                            "code": 400,
                            "message": "Failed to update appUserMaster information."
                        });
                    }
                    else {
                        res.send({
                            "code": 200,
                            "message": "AppUserMaster information updated successfully...",
                        });
                    }
                });
            } else {
                mm.executeQueryData('SELECT COUNT(ID) AS cnt FROM view_app_user_master WHERE  MOBILE_NUMBER =? AND STATUS = 1;', [MOBILE_NUMBER], supportKey, (error, resultsCheck) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to save appUserMaster information..."
                        });
                    }
                    else {
                        if (resultsCheck[0]?.cnt >= 2) {
                            res.send({
                                "code": 300,
                                "message": "Mobile Number Exeded user limit..."
                            });
                        } else {
                            mm.executeQueryData('INSERT INTO ' + appUserMaster + ' SET ?', data, supportKey, (error, results) => {
                                if (error) {
                                    console.log(error);
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to save appUserMaster information..."
                                    });
                                }
                                else {
                                    mm.executeQueryData(`SELECT * FROM view_app_user_master WHERE  MOBILE_NUMBER =? AND STATUS = 1;`, [MOBILE_NUMBER], supportKey, (error, resultsdata) => {
                                        if (error) {
                                            console.log(error);
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to get record...",
                                            });
                                        }
                                        else {
                                            if (resultsdata?.length > 0) {
                                                generateToken(resultsdata[0]?.ID, res, resultsdata, 0);
                                            } else {
                                                res.send({
                                                    "code": 400,
                                                    "message": "Failed to Register.",
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}


function generateToken(userId, res, resultsUser, userType) {
    try {
        var data = {
            "USER_ID": userId,
        }
        jwt.sign({ data }, process.env.SECRET, (error, token) => {
            if (error) {
                console.log("token error", error);
                //logger.error('APIK' + req.headers['apikey'] + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
            }
            else {
                res.send({
                    "code": 200,
                    "message": "Logged in successfully...",
                    "data": [
                        {
                            IS_NEW_USER: userType,
                        },
                        {
                            "token": token,
                            "UserData": resultsUser
                        }
                    ]
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

//open
exports.sendLoginOTP = (req, res) => {
    var MOBILE_NO = req.body.MOBILE_NO
    var supportKey = req.headers['supportkey'];
    var systemDate = mm.getSystemDate()
    try {
        // var OTP = 123456;
        var OTP = Math.floor(100000 + Math.random() * 900000);
        var body = `${OTP} is your Login OTP, Please do not share this OTP with anyone.`;
        const connection = mm.openConnection()
        if (MOBILE_NO && MOBILE_NO != " ") {
            if (MOBILE_NO == "8618749880" || MOBILE_NO == "9021900900" || MOBILE_NO == "9021600900") {
                OTP = 123456
            }
            mm.executeDML('INSERT INTO  REGISTRATION_OTP_DETAILS (MOBILE_NO,TYPE,OTP,OTP_MESSAGE,REQUESTED_DATETIME,CLIENT_ID,STATUS,IS_MOBILE_VERIFIED) VALUES (?,?,?,?,?,?,?,?)', [MOBILE_NO, 'M', OTP, body, systemDate, 1, 1, 0], supportKey, connection, (error, resultsOtp2) => {
                if (error) {
                    console.log(error);
                    mm.rollbackConnection(connection)
                    res.send({
                        "code": 400,
                        "message": "Failed to save Registration Details."
                    });
                } else {
                    var wparams = [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": OTP
                                }
                            ]
                        },
                        {
                            "type": "button",
                            "sub_type": "url",
                            "index": "0",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": OTP
                                }
                            ]
                        }
                    ]

                    mm.sendWAToolSMS("91" + MOBILE_NO, "genericotp", wparams, 'en', (error, resultswsms) => {
                        if (error) {
                            console.log(error)
                        }
                        else {
                            console.log(" whatsapp msg send : ", resultswsms)
                        }
                    })
                    mm.commitConnection(connection)
                    res.send({
                        "code": 200,
                        "message": "SUCESS."
                    });
                }
            });
        }
        else {
            mm.commitConnection(connection)
            res.send({
                "code": 400,
                "message": "Mobile number should not be blank.",
            });
        }
    } catch (error) {
        console.log(error);
        res.send({
            "code": 500,
            "message": "Something went wrong...",
        });
    }
}

//open
exports.verifyLoginOTP = (req, res) => {

    var MOBILE_NUMBER = req.body.MOBILE_NO
    var OTP = req.body.OTP
    var CLOUD_ID = req.body.CLOUD_ID
    var supportKey = req.headers['supportkey'];
    var systemDate = mm.getSystemDate();
    try {
        if (OTP && OTP != '' && MOBILE_NUMBER && MOBILE_NUMBER != '' && CLOUD_ID && CLOUD_ID != '') {
            mm.executeQueryData('SELECT ID,OTP FROM registration_otp_details WHERE MOBILE_NO=? ORDER BY ID DESC LIMIT 1', [MOBILE_NUMBER], supportKey, (error, results1) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to get Registration Details.",
                    });
                } else {
                    if (results1[0]?.OTP == OTP) {
                        mm.executeQueryData(`UPDATE registration_otp_details SET IS_MOBILE_VERIFIED = 1,MOBILE_VERIFICATION_DATETIME = ? WHERE ID = ?`, [systemDate, results1[0]?.ID], supportKey, (error, results) => {
                            if (error) {
                                console.log(error);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get record...",
                                });
                            }
                            else {
                                mm.executeQueryData(`SELECT *,(SELECT COUNT(ID) from app_user_master where MOBILE_NUMBER = ? ) AS USER_COUNT FROM view_app_user_master WHERE  MOBILE_NUMBER =? AND STATUS = 1;`, [MOBILE_NUMBER, MOBILE_NUMBER], supportKey, (error, results) => {
                                    if (error) {
                                        console.log(error);
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to get record...",
                                        });
                                    }
                                    else {
                                        var userData = results
                                        if (userData?.length > 0) {
                                            mm.executeQueryData(`UPDATE app_user_master SET CLOUD_ID = ? WHERE MOBILE_NUMBER = ?`, [CLOUD_ID, MOBILE_NUMBER], supportKey, (error, resultsUp) => {
                                                if (error) {
                                                    console.log(error);
                                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                    res.send({
                                                        "code": 400,
                                                        "message": "Failed to UPDATE record...",
                                                    });
                                                }
                                                else {
                                                    let IS_NEW_USER = 0
                                                    if (userData[0].IS_REGISTERED == 0) {
                                                        IS_NEW_USER = 1
                                                    }
                                                    generateToken(userData[0].ID, res, userData, IS_NEW_USER);
                                                }
                                            })
                                        } else {
                                            res.send({
                                                "code": 200,
                                                "message": "SUCESS...",
                                                "data": [
                                                    {
                                                        IS_NEW_USER: 1,
                                                    },
                                                    {
                                                        "UserData": []
                                                    }
                                                ]
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    else {
                        console.log(error);
                        res.send({
                            "code": 300,
                            "message": "Incorrect OTP. Please enter valid OTP.",
                        });
                    }
                }
            });
        }
        else {
            res.send({
                "code": 400,
                "message": "parameter  missing.",
            });
        }
    } catch (error) {
        console.log(error);
        res.send({
            "code": 400,
            "message": "Failed to update Registration Details.",
        });
    }
}


exports.addTeacher = (req, res) => {

    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers['supportkey'];
    var CLASS_IDS = req.body.CLASS_ID?.split(',');

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
            mm.executeDML("Select COUNT(ID) AS cnt from app_user_master where MOBILE_NUMBER = ? AND STATUS = 1;", [data.MOBILE_NUMBER], supportKey, connection, (error, Checkuser) => {
                if (error) {
                    mm.rollbackConnection(connection);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    })
                } else {
                    if (Checkuser[0].cnt >= 2) {
                        res.send({
                            "code": 300,
                            "KEY": "OLD",
                            "message": "Mobile Number Exeded User Limit...",
                        })
                    } else {
                        mm.executeDML('INSERT INTO ' + appUserMaster + ' SET ?', data, supportKey, connection, (error, results) => {
                            if (error) {
                                mm.rollbackConnection(connection);
                                console.log(error);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save appUserMaster information..."
                                });
                            }
                            else {
                                if (CLASS_IDS && CLASS_IDS.length > 0) {
                                    var inserQuery = `INSERT INTO class_teacher_mapping(CLASS_ID,TEACHER_ID,STATUS,CLIENT_ID) VALUES ?`
                                    var recordData = []
                                    for (let index = 0; index < CLASS_IDS.length; index++) {
                                        var class1 = CLASS_IDS[index];
                                        var rec = [class1, results.insertId, 1, data.CLIENT_ID];
                                        recordData.push(rec)
                                    }
                                    mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, result1) => {
                                        if (error) {
                                            console.log(error)
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            mm.rollbackConnection(connection);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to save class_teacher_mapping information..."
                                            });
                                        }
                                        else {
                                            mm.commitConnection(connection);
                                            res.send({
                                                "code": 200,
                                                "message": "class_teacher_mapping information saved successfully...",
                                            });
                                        }
                                    });
                                }
                                else {
                                    mm.commitConnection(connection);
                                    res.send({
                                        "code": 200,
                                        "message": "class_teacher_mapping information saved successfully...",
                                    });
                                }
                            }
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


exports.updateTeacher = (req, res) => {
    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var CLASS_IDS = req.body.CLASS_ID.split(',');

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
    } else {
        try {
            if (criteria.ID != null && CLASS_IDS.length > 0) {
                const connection = mm.openConnection()
                mm.executeDML(`UPDATE ` + appUserMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                    if (error) {

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to update user information."
                        });
                    } else {
                        var recData = []
                        for (let index = 0; index < CLASS_IDS.length; index++) {
                            var class1 = CLASS_IDS[index];
                            var rec = [class1, criteria.ID, 1, data.CLIENT_ID];
                            recData.push(rec)
                        }
                        mm.executeDML(`DELETE from class_teacher_mapping where TEACHER_ID = ${criteria.ID};INSERT INTO class_teacher_mapping(CLASS_ID,TEACHER_ID,STATUS,CLIENT_ID) VALUES ?`, [recData], supportKey, connection, (error, results) => {
                            if (error) {
                                console.log(error);
                                mm.rollbackConnection(connection);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save class_teacher_mapping information...",
                                });
                            }
                            else {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "class_teacher_mapping information updated successfully...",
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({
                    "code": 300,
                    "message": "Class ID and Teacher ID cannot be null",
                });
            }
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

//open
exports.loginTeacher = (req, res) => {
    try {
        var username = req.body.username;
        var password = req.body.password;
        //var cloudId = req.body.cloudid ? req.body.cloudid : '';
        var supportKey = req.headers['supportkey'];
        if ((!username && username == '' && username == undefined) && (!password && password == '' && password == undefined)) {
            res.send({
                "code": 400,
                "message": "username or password parameter missing...",
            });
        }
        else {
            mm.executeQuery(`SELECT *,3 AS ROLE_ID,(SELECT JSON_ARRAYAGG(JSON_OBJECT("CLASS_ID", CLASS_ID,"CLASS_NAME",CLASS_NAME,"SCHOOL_ID",SCHOOL_ID,"YEAR_ID",YEAR_ID,"DIVISION_ID",DIVISION_ID,"DIVISION_NAME",DIVISION_NAME)) from view_class_teacher_mapping where TEACHER_ID=m.ID AND STATUS=1) AS CLASS_DATA FROM view_app_user_master m  WHERE (MOBILE_NUMBER ='${username}' or EMAIL_ID='${username}') AND PASSWORD ='${password}' AND STATUS = 1 AND ROLE = "T"`, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    });
                }
                else {
                    if (results.length > 0) {

                        generateToken(results[0].ID, res, results, 0);
                    }
                    else {
                        res.send({
                            "code": 404,
                            "message": "Incorrect username or password..."
                        });
                    }
                }
            });
        }
    } catch (error) {
        console.log(error);
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
    }
}


exports.approveRejectTeacher = (req, res) => {
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

    var TEMP_SUBJECT_ID = JSON.parse(req.body.TEMP_SUBJECT_ID);
    var TEMP_CLASS_ID = JSON.parse(req.body.TEMP_CLASS_ID);

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            if (data.APPROVAL_STATUS == 'A') {
                setData += ` REJECT_BLOCKED_REMARK = ? ,`
                recordData.push(null)
            }
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE ` + appUserMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update teacherMaster information."
                    });
                }
                else {
                    if (data.APPROVAL_STATUS == "A") {
                        // if (TEMP_CLASS_ID && TEMP_CLASS_ID.length > 0 || TEMP_SUBJECT_ID && TEMP_SUBJECT_ID.length > 0) {
                        //     var inserQuery = "SELECT ID FROM class_teacher_mapping WHERE TEACHER_ID = 1 limit 1"
                        //     var recordData = []
                        //     if (TEMP_CLASS_ID && TEMP_CLASS_ID.length > 0) {
                        //         inserQuery = `INSERT INTO class_teacher_mapping(CLASS_ID,TEACHER_ID,STATUS,CLIENT_ID,YEAR_ID,DIVISION_ID) VALUES ?`
                        //         recordData = []
                        //         for (let i = 0; i < TEMP_CLASS_ID.length; i++) {
                        //             var rec = [TEMP_CLASS_ID[i].CLASS_ID, criteria.ID, 1, data.CLIENT_ID, TEMP_CLASS_ID[i].YEAR_ID, TEMP_CLASS_ID[i].DIVISION_ID];
                        //             recordData.push(rec)
                        //         }
                        //     }
                        //     mm.executeDML(inserQuery, [recordData], supportKey, connection, (error, result1) => {
                        //         if (error) {
                        //             console.log(error)
                        //             logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        //             mm.rollbackConnection(connection);
                        //             res.send({
                        //                 "code": 400,
                        //                 "message": "Failed to save class_teacher_mapping information..."
                        //             });
                        //         } else {
                        //             var inserSubQuery = "SELECT ID FROM subject_teacher_mapping WHERE TEACHER_ID = 1 limit 1"
                        //             var recordSubData = []
                        //             if (TEMP_SUBJECT_ID && TEMP_SUBJECT_ID.length > 0) {
                        //                 inserSubQuery = `INSERT INTO subject_teacher_mapping(CLASS_ID,TEACHER_ID,STATUS,CLIENT_ID,YEAR_ID,DIVISION_ID,SUBJECT_ID) VALUES ?`
                        //                 recordSubData = []
                        //                 for (let i = 0; i < TEMP_SUBJECT_ID.length; i++) {
                        //                     var rec = [TEMP_SUBJECT_ID[i].CLASS_ID, criteria.ID, 1, data.CLIENT_ID, TEMP_SUBJECT_ID[i].YEAR_ID, TEMP_SUBJECT_ID[i].DIVISION_ID, TEMP_SUBJECT_ID[i].SUBJECT_ID];
                        //                     recordSubData.push(rec)
                        //                 }
                        //             }
                        //             mm.executeDML(inserSubQuery, [recordSubData], supportKey, connection, (error, result1) => {
                        //                 if (error) {
                        //                     console.log(error)
                        //                     logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        //                     mm.rollbackConnection(connection);
                        //                     res.send({
                        //                         "code": 400,
                        //                         "message": "Failed to save subject_teacher_mapping information..."
                        //                     });
                        //                 }
                        //                 else {
                        var TITLE = `Your School Registration Application Has Been Approved by Admin`
                        var DESCRIPTION = `Dear ${data.NAME},
    
                                    We are pleased to inform you that your school registration application has been approved by the admin.
                                    Thank you for your cooperation, and we look forward to serving you better in the future.
                                    Best regards,
                                    12 Dimensions`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        mm.sendNotificationToId(criteria.ID, TITLE, DESCRIPTION, "", "", supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + criteria.ID);
                            }
                        })
                        // mm.sendWSMS(MOBILE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log('Whatsapp message sent to :' + MOBILE_NUMBER);
                        //     }
                        // })
                        // mm.sendEmail(EMAIL_ID, TITLE, DESCRIPTION, (error, resultsMail2) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log("Mail sent successfully... ");
                        //     }
                        // })
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "class_teacher_mapping information saved successfully...",
                        });
                        //                 }
                        //             });
                        //         }
                        //     });
                        // }
                        // else {
                        //     mm.rollbackConnection(connection);
                        //     res.send({
                        //         "code": 300,
                        //         "message": "CLASS_ID or SUBJECT_ID is required.",
                        //     });
                        // }
                    } else if (data.APPROVAL_STATUS == "R") {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "school information updated successfully..."
                        });

                        var TITLE = `School Registration Application has been Rejected by Admin`
                        var DESCRIPTION = `Dear ${data.NAME},

                                                We regret to inform you that your school registration application has been rejected by the admin. Please check the remark : ${data.REJECT_BLOCKED_REMARK}

                                                Thank you for your cooperation, and we look forward to serving you better in the future.

                                                Best regards,
                                                12 Dimensions`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        mm.sendNotificationToId(criteria.ID, TITLE, DESCRIPTION, "", "", supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + criteria.ID);
                            }
                        })
                        // mm.sendWSMS(MOBILE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log('Whatsapp message sent to :' + MOBILE_NUMBER);
                        //     }
                        // })
                        // mm.sendEmail(EMAIL_ID, TITLE, DESCRIPTION, (error, resultsMail2) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log("Mail sent successfully... ");
                        //     }
                        // })
                    } else {
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 300,
                            "message": "Wrong status..."
                        });
                    }
                }
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
}


exports.getTeacherCount = (req, res) => {

    // var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';
    // var pageSize = req.body.pageSize ? req.body.pageSize : '';
    // var start = 0;
    // var end = 0;

    // if (pageIndex != '' && pageSize != '') {
    //     start = (pageIndex - 1) * pageSize;
    //     end = pageSize;
    // }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    // if (pageIndex === '' && pageSize === '')
    criteria = filter + " order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('SELECT COUNT(ID) AS ALL_COUNT,COUNT(IF(APPROVAL_STATUS="A",1,null)) AS APPROVED,COUNT(IF(APPROVAL_STATUS="R",1,null)) AS REJECTED,COUNT(IF(APPROVAL_STATUS="P",1,null)) AS PENDING,COUNT(IF(APPROVAL_STATUS="B",1,null)) AS BLOCKED from app_user_master where ROLE="T" ' + criteria, supportKey, (error, results) => {
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


exports.importStudents = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var EXCEL_FILE_NAME = req.body.EXCEL_FILE_NAME;
    var CLASS_ID = req.body.CLASS_ID;
    var YEAR_ID = req.body.YEAR_ID;
    var SCHOOL_ID = req.body.SCHOOL_ID;
    var DIVISION_ID = req.body.DIVISION_ID;
    var MEDIUM_ID = req.body.MEDIUM_ID

    try {
        const workbook = xlsx.readFile(`./uploads/studentExcel/${EXCEL_FILE_NAME}`)
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const studentData = xlsx.utils.sheet_to_json(sheet);

        if (studentData && studentData.length > 0 && CLASS_ID != null && YEAR_ID != null) {

            var mobileNumbers = Object.entries(studentData.reduce((acc, { MOBILE_NUMBER }) => {
                acc[MOBILE_NUMBER] = (acc[MOBILE_NUMBER] || 0) + 1;
                return acc;
            }, {})).filter(([_, count]) => count === 2).map(([mobileNumber, _]) => parseInt(mobileNumber));
            if (mobileNumbers == null || mobileNumbers == "" || mobileNumbers == undefined) {
                mobileNumbers = "0";
            }

            var isRepeated = Object.values(studentData.reduce((acc, { MOBILE_NUMBER }) => {
                acc[MOBILE_NUMBER] = (acc[MOBILE_NUMBER] || 0) + 1;
                return acc;
            }, {})).some(count => count > 2);

            var commaSeparatedMobileNumbers = studentData.map(item => `${item.MOBILE_NUMBER}`).join(',');

            const connection = mm.openConnection();
            mm.executeDML(`SELECT MOBILE_NUMBER,COUNT(MOBILE_NUMBER) AS COUNT FROM app_user_master WHERE STATUS = 1 AND MOBILE_NUMBER IN (${commaSeparatedMobileNumbers}) GROUP BY MOBILE_NUMBER HAVING COUNT(MOBILE_NUMBER) >= 2; SELECT count(ID) COUNT from app_user_master WHERE STATUS = 1 AND MOBILE_NUMBER in(${mobileNumbers});`, [], supportKey, connection, (error, resultsCheck) => {
                if (error) {
                    console.log(error)
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    })
                }
                else {
                    if (resultsCheck && resultsCheck[0].length < 1 && resultsCheck[1][0].COUNT < 1 && !isRepeated) {
                        mm.executeDML(`SELECT * from class_fee_mapping WHERE CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?`, [CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, results1) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection)
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get class fee information."
                                });
                            }
                            else {
                                var feeDetails = results1
                                var seqNo = 1;
                                if (feeDetails && feeDetails.length > 0) {
                                    async.eachSeries(studentData, function iteratorOverElems(element, callback) {
                                        // mm.executeDML('Select ID from app_user_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?', [element.MOBILE_NUMBER, element.EMAIL_ID], supportKey, connection, (error, resultscheckuser) => {
                                        //     if (error) {
                                        //         console.log(error)
                                        //         callback(error);
                                        //     } else {
                                        //         var USER_ID = null
                                        //         if (resultscheckuser && resultscheckuser.length > 0 && resultscheckuser[0]?.ID != null) {
                                        //             USER_ID = resultscheckuser[0].ID
                                        //         }
                                        mm.executeDML('INSERT INTO app_user_master (NAME,MOBILE_NUMBER,IDENTITY_NUMBER,GENDER,CLIENT_ID,PASSWORD,STATUS,SCHOOL_ID,APPROVAL_STATUS,ROLE) VALUES (?,?,?,?,?,?,?,?,?,?)', [element.NAME, element.MOBILE_NUMBER, element.IDENTITY_NUMBER, element.GENDER, 1, "12345678", 1, SCHOOL_ID, "A", "S"], supportKey, connection, (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                callback(error);
                                            }
                                            else {
                                                mm.executeDML('INSERT INTO student_class_mapping (STUDENT_ID,ROLL_NUMBER,YEAR_ID,CLASS_ID,DIVISION_ID,MEDIUM_ID,CLIENT_ID,STATUS) VALUES (?,?,?,?,?,?,?,?)', [results.insertId, element.ROLL_NUMBER, YEAR_ID, CLASS_ID, DIVISION_ID, MEDIUM_ID, 1, 1], supportKey, connection, (error, resultsSm) => {
                                                    if (error) {
                                                        console.log(error)
                                                        callback(error);
                                                    }
                                                    else {
                                                        seqNo = seqNo + 1
                                                        var FEE = feeDetails.reduce(function (acc, obj) { return acc + obj.AMOUNT; }, 0);
                                                        mm.executeDML('INSERT INTO student_fee_master (STUDENT_ID,YEAR_ID,CLASS_ID,DIVISION_ID,PENDING_FEE,TOTAL_FEE,PAID_FEE,DISCOUNT_AMOUNT,DISCOUNT_TYPE,DISCOUNT_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [results.insertId, YEAR_ID, CLASS_ID, DIVISION_ID, FEE, FEE, 0, 0, 0, 0, 1], supportKey, connection, (error, resultsFee) => {
                                                            if (error) {
                                                                console.log(error)
                                                                callback(error);
                                                            }
                                                            else {
                                                                async.eachSeries(feeDetails, function iteratorOverElems(element, callback2) {
                                                                    mm.executeDML('INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,HEAD_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [resultsFee.insertId, element.AMOUNT, "0", element.AMOUNT, element.HEAD_ID, 1, 1], supportKey, connection, (error, resultsSmf) => {
                                                                        if (error) {
                                                                            console.log(error)
                                                                            callback2(error);
                                                                        }
                                                                        else {
                                                                            callback2();
                                                                        }
                                                                    });
                                                                }, function subCb2(error) {
                                                                    if (error) {
                                                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                                        callback(error)
                                                                    } else {
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                        //     }
                                        // });
                                    }, function subCb(error) {
                                        if (error) {
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            mm.rollbackConnection(connection)
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to Create Students..."
                                            });
                                        } else {
                                            mm.commitConnection(connection)
                                            res.send({
                                                "code": 200,
                                                "message": "Student Imported Successfully...",
                                            });
                                        }
                                    });
                                } else {
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "code": 301,
                                        "message": "Fee Details Not Found..."
                                    })
                                }
                            }
                        });
                    } else {
                        mm.rollbackConnection(connection)
                        res.send({
                            "code": 300,
                            "message": "Duplicate Mobile Number Found..."
                        });
                    }
                }
            });
        } else {
            res.send({
                "code": 302,
                "message": "Parameter Missing...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}


exports.promoteStudents = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var STUDENT_DATA = req.body.STUDENT_DATA;
    var CLASS_ID = req.body.CLASS_ID;
    var YEAR_ID = req.body.YEAR_ID;
    var DIVISION_ID = req.body.DIVISION_ID
    var MEDIUM_ID = req.body.MEDIUM_ID

    try {
        if (STUDENT_DATA && STUDENT_DATA.length > 0 && CLASS_ID != null && YEAR_ID != null) {
            const connection = mm.openConnection();
            mm.executeDML(`SELECT * from class_fee_mapping WHERE CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?`, [CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, results1) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection)
                    res.send({
                        "code": 400,
                        "message": "Failed to update studentMaster information."
                    });
                }
                else {
                    var feeDetails = results1
                    if (feeDetails && feeDetails.length > 0) {
                        async.eachSeries(STUDENT_DATA, function iteratorOverElems(element, callback) {
                            var studentId = element
                            mm.executeDML('UPDATE student_class_mapping SET STATUS = 2 WHERE STUDENT_ID = ?;UPDATE student_fee_master SET STATUS = 2 WHERE STUDENT_ID = ?;', [studentId, studentId], supportKey, connection, (error, results) => {
                                if (error) {
                                    console.log(error)
                                    callback(error);
                                }
                                else {
                                    mm.executeDML('INSERT INTO student_class_mapping (STUDENT_ID,ROLL_NUMBER,YEAR_ID,CLASS_ID,DIVISION_ID,MEDIUM_ID,CLIENT_ID,STATUS) VALUES (?,?,?,?,?,?,?,?)', [studentId, "", YEAR_ID, CLASS_ID, DIVISION_ID, MEDIUM_ID, 1, 1], supportKey, connection, (error, resultsSm) => {
                                        if (error) {
                                            console.log(error)
                                            callback(error);
                                        }
                                        else {
                                            var FEE = feeDetails.reduce(function (acc, obj) { return acc + obj.AMOUNT; }, 0);
                                            mm.executeDML('INSERT INTO student_fee_master (STUDENT_ID,YEAR_ID,CLASS_ID,DIVISION_ID,PENDING_FEE,TOTAL_FEE,PAID_FEE,DISCOUNT_AMOUNT,DISCOUNT_TYPE,DISCOUNT_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [studentId, YEAR_ID, CLASS_ID, DIVISION_ID, FEE, FEE, 0, 0, 0, 0, 1], supportKey, connection, (error, resultsFee) => {
                                                if (error) {
                                                    console.log(error)
                                                    callback(error);
                                                }
                                                else {
                                                    async.eachSeries(feeDetails, function iteratorOverElems(element, callback2) {
                                                        mm.executeDML('INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,HEAD_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [resultsFee.insertId, element.AMOUNT, "0", element.AMOUNT, element.HEAD_ID, 1, 1], supportKey, connection, (error, resultsSmf) => {
                                                            if (error) {
                                                                console.log(error)
                                                                callback2(error);
                                                            }
                                                            else {
                                                                callback2();
                                                            }
                                                        });
                                                    }, function subCb2(error) {
                                                        if (error) {
                                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                            callback(error)
                                                        } else {
                                                            callback();
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }, function subCb(error) {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                mm.rollbackConnection(connection)
                                res.send({
                                    "code": 400,
                                    "message": "Failed to Create Files..."
                                });
                            } else {
                                mm.commitConnection(connection)
                                res.send({
                                    "code": 200,
                                    "message": "Student Promoted Successfully...",
                                });
                            }
                        });
                    } else {
                        mm.rollbackConnection(connection)
                        res.send({
                            "code": 300,
                            "message": "Fee Details Not Found..."
                        })
                    }
                }
            });
        } else {
            res.send({
                "code": 300,
                "message": "Parameter Missing...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}


exports.createStudents = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var studentData = req.body.studentData;
    var CLASS_ID = req.body.CLASS_ID;
    var YEAR_ID = req.body.YEAR_ID;
    var SCHOOL_ID = req.body.SCHOOL_ID;
    var DIVISION_ID = req.body.DIVISION_ID;
    var MEDIUM_ID = req.body.MEDIUM_ID;
    try {
        if (studentData && studentData.length > 0 && CLASS_ID && YEAR_ID) {

            var mobileNumbers = Object.entries(studentData.reduce((acc, { MOBILE_NUMBER }) => {
                acc[MOBILE_NUMBER] = (acc[MOBILE_NUMBER] || 0) + 1;
                return acc;
            }, {})).filter(([_, count]) => count === 2).map(([mobileNumber, _]) => parseInt(mobileNumber));

            if (mobileNumbers == null || mobileNumbers == "" || mobileNumbers == undefined) {
                mobileNumbers = "0";
            }
            var isRepeated = Object.values(studentData.reduce((acc, { MOBILE_NUMBER }) => {
                acc[MOBILE_NUMBER] = (acc[MOBILE_NUMBER] || 0) + 1;
                return acc;
            }, {})).some(count => count > 2);

            var commaSeparatedMobileNumbers = studentData.map(item => `${item.MOBILE_NUMBER}`).join(',');

            const connection = mm.openConnection();
            mm.executeDML(`SELECT MOBILE_NUMBER,COUNT(MOBILE_NUMBER) AS COUNT FROM app_user_master WHERE STATUS = 1 AND MOBILE_NUMBER IN (${commaSeparatedMobileNumbers}) GROUP BY MOBILE_NUMBER HAVING COUNT(MOBILE_NUMBER) >= 2; SELECT count(ID) COUNT from app_user_master WHERE STATUS = 1 AND MOBILE_NUMBER in(${mobileNumbers})`, [], supportKey, connection, (error, resultsCheck) => {
                if (error) {
                    console.log(error)
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    })
                }
                else {
                    if (resultsCheck && resultsCheck[0].length < 1 && resultsCheck[1][0].COUNT < 1 && !isRepeated) {
                        mm.executeDML(`SELECT * from class_fee_mapping WHERE CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?`, [CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, results1) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection)
                                res.send({
                                    "code": 400,
                                    "message": "Failed to update studentMaster information."
                                });
                            }
                            else {
                                var feeDetails = results1
                                if (feeDetails && feeDetails.length > 0) {
                                    async.eachSeries(studentData, function iteratorOverElems(element, callback) {
                                        // mm.executeDML('Select ID from app_user_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?', [element.MOBILE_NUMBER, element.EMAIL_ID], supportKey, connection, (error, resultscheckuser) => {
                                        //     if (error) {
                                        //         console.log(error)
                                        //         callback(error);
                                        //     } else {
                                        //         var USER_ID = null
                                        //         if (resultscheckuser && resultscheckuser.length > 0 && resultscheckuser[0]?.ID != null) {
                                        //             USER_ID = resultscheckuser[0].ID
                                        //         }
                                        mm.executeDML('INSERT INTO app_user_master (NAME,MOBILE_NUMBER,IDENTITY_NUMBER,GENDER,CLIENT_ID,PASSWORD,STATUS,SCHOOL_ID,APPROVAL_STATUS,CITY_ID,COUNTRY_ID,DISTRICT_ID,DOB,ADDRESS,STATE_ID,EMAIL_ID,ROLE) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [element.NAME, element.MOBILE_NUMBER, element.IDENTITY_NUMBER, element.GENDER, 1, "12345678", 1, SCHOOL_ID, "A", element.CITY_ID, element.COUNTRY_ID, element.DISTRICT_ID, element.DOB, element.ADDRESS, element.STATE_ID, element.EMAIL_ID, "S"], supportKey, connection, (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                callback(error);
                                            }
                                            else {
                                                mm.executeDML('INSERT INTO student_class_mapping (STUDENT_ID,ROLL_NUMBER,YEAR_ID,CLASS_ID,DIVISION_ID,MEDIUM_ID,CLIENT_ID,STATUS) VALUES (?,?,?,?,?,?,?,?)', [results.insertId, element.ROLL_NUMBER, YEAR_ID, CLASS_ID, DIVISION_ID, MEDIUM_ID, 1, 1], supportKey, connection, (error, resultsSm) => {
                                                    if (error) {
                                                        console.log(error)
                                                        callback(error);
                                                    }
                                                    else {
                                                        var FEE = feeDetails.reduce(function (acc, obj) { return acc + obj.AMOUNT; }, 0);
                                                        mm.executeDML('INSERT INTO student_fee_master (STUDENT_ID,YEAR_ID,CLASS_ID,DIVISION_ID,PENDING_FEE,TOTAL_FEE,PAID_FEE,DISCOUNT_AMOUNT,DISCOUNT_TYPE,DISCOUNT_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [results.insertId, YEAR_ID, CLASS_ID, DIVISION_ID, FEE, FEE, 0, 0, 0, 0, 1], supportKey, connection, (error, resultsFee) => {
                                                            if (error) {
                                                                console.log(error)
                                                                callback(error);
                                                            }
                                                            else {
                                                                async.eachSeries(feeDetails, function iteratorOverElems(element, callback2) {
                                                                    mm.executeDML('INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,HEAD_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [resultsFee.insertId, element.AMOUNT, "0", element.AMOUNT, element.HEAD_ID, 1, 1], supportKey, connection, (error, resultsSmf) => {
                                                                        if (error) {
                                                                            console.log(error)
                                                                            callback2(error);
                                                                        }
                                                                        else {
                                                                            callback2();
                                                                        }
                                                                    });
                                                                }, function subCb2(error) {
                                                                    if (error) {
                                                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                                        callback(error)
                                                                    } else {
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                        //     }
                                        // });
                                    }, function subCb(error) {
                                        if (error) {
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            mm.rollbackConnection(connection)
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to Create Students..."
                                            });
                                        } else {
                                            mm.commitConnection(connection)
                                            res.send({
                                                "code": 200,
                                                "message": "Student Imported Successfully...",
                                            });
                                        }
                                    });
                                } else {
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "code": 300,
                                        "message": "Fee Details Not Found..."
                                    })
                                }
                            }
                        });
                    } else {
                        mm.rollbackConnection(connection)
                        res.send({
                            "code": 300,
                            "message": "Duplicate Mobile Number Found..."
                        });
                    }
                }
            });
        } else {
            res.send({
                "code": 301,
                "message": "parameter missing..."
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}


exports.mapClassStudent = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var STUDENT_ID = req.body.STUDENT_ID;
    var CLASS_ID = req.body.CLASS_ID;
    var YEAR_ID = req.body.YEAR_ID;
    var DIVISION_ID = req.body.DIVISION_ID;
    var MEDIUM_ID = req.body.MEDIUM_ID;
    var ROLL_NUMBER = req.body.ROLL_NUMBER

    try {
        const connection = mm.openConnection();
        mm.executeDML(`SELECT ID,IFNULL(PAID_FEE,0) PAID_FEE from student_fee_master where STUDENT_ID = ? AND YEAR_ID = ? AND CLASS_ID = ? AND DIVISION_ID = ? ;SELECT * from class_fee_mapping WHERE CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?;`, [STUDENT_ID, YEAR_ID, CLASS_ID, DIVISION_ID, CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, resultsCheck) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                mm.rollbackConnection(connection)
                res.send({
                    "code": 400,
                    "message": "Failed to update studentMaster information."
                });
            }
            else {
                let FEE_MASTER_ID = resultsCheck[0][0]?.ID ? resultsCheck[0][0]?.ID : 0
                mm.executeDML(`DELETE FROM student_class_mapping WHERE STUDENT_ID = ? AND STATUS = 1;DELETE FROM student_fee_details WHERE FEE_MASTER_ID = ?;DELETE FROM student_fee_master WHERE ID = ?;`, [STUDENT_ID, FEE_MASTER_ID, FEE_MASTER_ID], supportKey, connection, (error, resultsd) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection)
                        res.send({
                            "code": 400,
                            "message": "Failed to update studentMaster information."
                        });
                    }
                    else {
                        mm.executeDML('INSERT INTO student_class_mapping (STUDENT_ID,ROLL_NUMBER,YEAR_ID,CLASS_ID,DIVISION_ID,MEDIUM_ID,CLIENT_ID,STATUS) VALUES (?,?,?,?,?,?,?,?)', [STUDENT_ID, ROLL_NUMBER, YEAR_ID, CLASS_ID, DIVISION_ID, MEDIUM_ID, 1, 1], supportKey, connection, (error, resultsSm) => {
                            if (error) {
                                console.log(error)
                                mm.rollbackConnection(connection)
                                res.send({
                                    "code": 400,
                                    "message": "Failed to update studentMaster information."
                                })
                            }
                            else {
                                if (resultsCheck[1].length > 0) {
                                    var feeDetails = resultsCheck[1]
                                    var PAID_FEE = resultsCheck[0][0]?.PAID_FEE ? resultsCheck[0][0]?.PAID_FEE : 0
                                    var FEE = feeDetails.reduce(function (acc, obj) { return acc + obj.AMOUNT; }, 0);
                                    mm.executeDML('INSERT INTO student_fee_master (STUDENT_ID,YEAR_ID,CLASS_ID,DIVISION_ID,PENDING_FEE,TOTAL_FEE,PAID_FEE,DISCOUNT_AMOUNT,DISCOUNT_TYPE,DISCOUNT_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [STUDENT_ID, YEAR_ID, CLASS_ID, DIVISION_ID, FEE - PAID_FEE, FEE, PAID_FEE, 0, 0, 0, 1], supportKey, connection, (error, resultsFee) => {
                                        if (error) {
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            console.log(error)
                                            mm.rollbackConnection(connection);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to update student_class_mapping information."
                                            })
                                        }
                                        else {
                                            async.eachSeries(feeDetails, function iteratorOverElems(element, callback) {
                                                var AMOUNT = element.AMOUNT
                                                var PAID = 0
                                                if (PAID_FEE > AMOUNT) {
                                                    PAID = AMOUNT
                                                    PAID_FEE = PAID_FEE - AMOUNT
                                                } else {
                                                    PAID = PAID_FEE
                                                    PAID_FEE = 0
                                                }
                                                var PENDING = AMOUNT - PAID
                                                mm.executeDML('INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,HEAD_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [resultsFee.insertId, AMOUNT, PAID, PENDING, element.HEAD_ID, 1, 1], supportKey, connection, (error, resultsSmf) => {
                                                    if (error) {
                                                        console.log(error)
                                                        callback(error);
                                                    }
                                                    else {
                                                        callback();
                                                    }
                                                });
                                            }, function subCb(error) {
                                                if (error) {
                                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                    mm.rollbackConnection(connection)
                                                    res.send({
                                                        "code": 400,
                                                        "message": "Failed to update studentMaster information."
                                                    })
                                                } else {
                                                    mm.commitConnection(connection)
                                                    res.send({
                                                        "code": 200,
                                                        "message": "studentMaster information updated successfully...",
                                                    })
                                                }
                                            });
                                        }
                                    })
                                } else {
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "code": 300,
                                        "message": "fee details not found..."
                                    })
                                }
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error); res.send({
            "code": 500,
            "message": "Something Went Wrong..."
        });
    }
}


exports.getStudentCount = (req, res) => {

    // var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';
    // var pageSize = req.body.pageSize ? req.body.pageSize : '';
    // var start = 0;
    // var end = 0;

    // if (pageIndex != '' && pageSize != '') {
    //     start = (pageIndex - 1) * pageSize;
    //     end = pageSize;
    // }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    // if (pageIndex === '' && pageSize === '')
    criteria = filter + " order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('SELECT COUNT(ID) AS ALL_COUNT,COUNT(IF(APPROVAL_STATUS="A",1,null)) AS APPROVED,COUNT(IF(APPROVAL_STATUS="R",1,null)) AS REJECTED,COUNT(IF(APPROVAL_STATUS="P",1,null)) AS PENDING,COUNT(IF(APPROVAL_STATUS="B",1,null)) AS BLOCKED from view_app_user_master where ROLE = "S" ' + criteria, supportKey, (error, results) => {
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


exports.approveRejectStudent = (req, res) => {
    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    var systemDate = mm.getSystemDate();
    // data.TEMP_CLASS_ID = ""
    // data.TEMP_DIVISION_ID = ""
    // data.TEMP_MEDIUM_ID = ""
    // data.TEMP_ROLL_NO = ""
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });
    var APPROVAL_STATUS = req.body.APPROVAL_STATUS
    var NAME = req.body.NAME
    var MOBILE_NUMBER = req.body.MOBILE_NUMBER
    var EMAIL_ID = req.body.EMAIL_ID
    var CLASS_ID = req.body.TEMP_CLASS_ID
    var YEAR_ID = req.body.YEAR_ID
    var DIVISION_ID = req.body.TEMP_DIVISION_ID
    var MEDIUM_ID = req.body.TEMP_CLASS_ID
    var ROLL_NUMBER = req.body.TEMP_ROLL_NO

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            // if (data.TEMP_MEDIUM_ID == "" || data.TEMP_MEDIUM_ID == null) {
            //     setData += ` TEMP_MEDIUM_ID = ? ,`
            //     recordData.push(null)
            // }
            // if (data.TEMP_DIVISION_ID == "" || data.TEMP_DIVISION_ID == null) {
            //     setData += ` TEMP_DIVISION_ID = ? ,`
            //     recordData.push(null)
            // }
            // if (data.TEMP_CLASS_ID == "" || data.TEMP_CLASS_ID == null) {
            //     setData += ` TEMP_CLASS_ID = ? ,`
            //     recordData.push(null)
            // }
            // if (data.TEMP_ROLL_NO == "" || data.TEMP_ROLL_NO == null) {
            //     setData += ` TEMP_ROLL_NO = ? ,`
            //     recordData.push(null)
            // }
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE ` + appUserMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update studentMaster information."
                    });
                }
                else {
                    if (APPROVAL_STATUS == "A") {
                        mm.executeDML('SELECT * from class_fee_mapping WHERE CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?', [CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, resultsSm) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error)
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to update student_class_mapping information."
                                })
                            }
                            else {
                                var feeDetails = resultsSm
                                if (feeDetails && feeDetails.length > 0) {
                                    mm.executeDML('INSERT INTO student_class_mapping (STUDENT_ID,ROLL_NUMBER,YEAR_ID,CLASS_ID,DIVISION_ID,MEDIUM_ID,CLIENT_ID,STATUS) VALUES (?,?,?,?,?,?,?,?)', [criteria.ID, ROLL_NUMBER, YEAR_ID, CLASS_ID, DIVISION_ID, MEDIUM_ID, 1, 1], supportKey, connection, (error, resultsSm) => {
                                        if (error) {
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            console.log(error)
                                            mm.rollbackConnection(connection);
                                            res.send({
                                                "code": 400,
                                                "message": "Failed to update student_class_mapping information."
                                            })
                                        }
                                        else {
                                            var FEE = feeDetails.reduce(function (acc, obj) { return acc + obj.AMOUNT; }, 0);
                                            mm.executeDML('INSERT INTO student_fee_master (STUDENT_ID,YEAR_ID,CLASS_ID,DIVISION_ID,PENDING_FEE,TOTAL_FEE,PAID_FEE,DISCOUNT_AMOUNT,DISCOUNT_TYPE,DISCOUNT_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [criteria.ID, YEAR_ID, CLASS_ID, DIVISION_ID, FEE, FEE, 0, 0, 0, 0, 1], supportKey, connection, (error, resultsFee) => {
                                                if (error) {
                                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                    console.log(error)
                                                    mm.rollbackConnection(connection);
                                                    res.send({
                                                        "code": 400,
                                                        "message": "Failed to update student_class_mapping information."
                                                    })
                                                }
                                                else {
                                                    async.eachSeries(feeDetails, function iteratorOverElems(element, callback) {
                                                        mm.executeDML('INSERT INTO student_fee_details (FEE_MASTER_ID,TOTAL_FEE,PAID_FEE,PENDING_FEE,HEAD_ID,STATUS,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [resultsFee.insertId, element.AMOUNT, "0", element.AMOUNT, element.HEAD_ID, 1, 1], supportKey, connection, (error, resultsSmf) => {
                                                            if (error) {
                                                                console.log(error)
                                                                callback(error)
                                                            }
                                                            else {
                                                                callback()
                                                            }
                                                        });
                                                    }, function subCb(error) {
                                                        if (error) {
                                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                            console.log(error);
                                                            mm.rollbackConnection(connection);
                                                            res.send({
                                                                "code": 400,
                                                                "message": "Failed to update student_class_mapping information."
                                                            });
                                                        } else {
                                                            mm.commitConnection(connection);
                                                            res.send({
                                                                "code": 200,
                                                                "message": "school information updated successfully..."
                                                            });
                                                            var TITLE = `Your School Registration Application Has Been Approved Admin`
                                                            var DESCRIPTION = `Dear ${NAME},
        
                                                            We are pleased to inform you that your school registration application has been approved by the admin.
                                                            Thank you for your cooperation, and we look forward to serving you better in the future.
    
                                                            Best regards,
                                                            12 Dimensions`
                                                            var wparams = [{
                                                                "type": "text",
                                                                "text": TITLE
                                                            }]
                                                            mm.sendNotificationToId(criteria.ID, TITLE, DESCRIPTION, "", "", supportKey, (err, notification) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                } else {
                                                                    console.log('notification sent to :' + criteria.ID);
                                                                }
                                                            })
                                                            // mm.sendWSMS(MOBILE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                                                            //     if (error) {
                                                            //         console.log(error);
                                                            //     }
                                                            //     else {
                                                            //         console.log('Whatsapp message sent to :' + MOBILE_NUMBER);
                                                            //     }
                                                            // })
                                                            // mm.sendEmail(EMAIL_ID, TITLE, DESCRIPTION, (error, resultsMail2) => {
                                                            //     if (error) {
                                                            //         console.log(error);
                                                            //     }
                                                            //     else {
                                                            //         console.log("Mail sent successfully... ");
                                                            //     }
                                                            // })
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    });
                                } else {
                                    mm.rollbackConnection(connection)
                                    res.send({
                                        "code": 300,
                                        "message": "Fee Details Not Found..."
                                    })
                                }
                            }
                        });
                    } else if (APPROVAL_STATUS == "R") {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "school information updated successfully..."
                        });

                        var TITLE = `Your School Registration Application has been Rejected by Admin`
                        var DESCRIPTION = `Dear ${NAME},

                                                    We regret to inform you that your school registration application has been rejected by the admin. Please check the remark : ${data.REJECT_BLOCKED_REMARK}

                                                    Thank you for your cooperation, and we look forward to serving you better in the future.

                                                    Best regards,
                                                    12 Dimensions`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        mm.sendNotificationToId(criteria.ID, TITLE, DESCRIPTION, "", "", supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + criteria.ID);
                            }
                        })

                        // mm.sendWSMS(MOBILE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log('Whatsapp message sent to :' + MOBILE_NUMBER);
                        //     }
                        // })
                        // mm.sendEmail(EMAIL_ID, TITLE, DESCRIPTION, (error, resultsMail2) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log("Mail sent successfully... ");
                        //     }
                        // })
                    } else {
                        mm.rollbackConnection(connection)
                        res.send({
                            "code": 402,
                            "message": "Wrong status..."
                        });
                    }
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error); res.send({
                "code": 500,
                "message": "Something Went Wrong..."
            });
        }
    }
}


exports.getAppUserSummary = (req, res) => {

    let FROM_DATE = req.body.FROM_DATE ? req.body.FROM_DATE : '';
    let TO_DATE = req.body.TO_DATE ? req.body.TO_DATE : '';

    let sortKey = req.body.sortKey ? req.body.sortKey : 'ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    criteria = filter + " order by " + sortKey + " " + sortValue;

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`SELECT DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) AS DATE, (SELECT COUNT(ID) from app_user_master master WHERE DATE(CREATED_MODIFIED_DATE) = DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) ) as COUNT FROM (SELECT @row := @row + 1 AS n FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30) AS t1,(SELECT @row := -1) AS t2) t WHERE DATE_ADD(${FROM_DATE}, INTERVAL t.n DAY) <= ${TO_DATE};`, supportKey, (error, results) => {
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

exports.sendRegistrationMessage = (req, res) => {
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

        mm.sendWAToolSMS("91" + MOBILE_NUMBER, "registration", wparams, 'en', (error, resultswsms) => {
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
