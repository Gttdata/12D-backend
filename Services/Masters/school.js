const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var schoolMaster = "school_master";
var viewSchoolMaster = "view_" + schoolMaster;

function reqData(req) {

    var data = {
        COUNTRY_ID: req.body.COUNTRY_ID,
        STATE_ID: req.body.STATE_ID,
        CITY_ID: req.body.CITY_ID,
        DISTRICT_ID: req.body.DISTRICT_ID,
        SCHOOL_NAME: req.body.SCHOOL_NAME,
        ADDRESS: req.body.ADDRESS,
        PINCODE: req.body.PINCODE,
        PHONE_NUMBER: req.body.PHONE_NUMBER,
        PRINCIPLE_ID: req.body.PRINCIPLE_ID,
        EMAIL_ID: req.body.EMAIL_ID,
        UPI_ID: req.body.UPI_ID,
        PASSWORD: req.body.PASSWORD,
        SEQ_NO: req.body.SEQ_NO,
        BOARD_ID: req.body.BOARD_ID,
        STATUS: req.body.STATUS ? '1' : '0',
        SCHOOL_STATUS: req.body.SCHOOL_STATUS,
        REJECT_BLOCKED_REMARK: req.body.REJECT_BLOCKED_REMARK,
        COUNTRY_NAME: req.body.COUNTRY_NAME,
        STATE_NAME: req.body.STATE_NAME,
        DISTRICT_NAME: req.body.DISTRICT_NAME,
        YEAR_ID: req.body.YEAR_ID,
        BOARD_MEDIUM_ID: req.body.BOARD_MEDIUM_ID,
        DESCRIPTION: req.body.DESCRIPTION,
        IFSC_CODE: req.body.IFSC_CODE,
        BANK_NAME: req.body.BANK_NAME,
        ACC_NO: req.body.ACC_NO,
        ACC_HOLDER_NAME: req.body.ACC_HOLDER_NAME,
        IS_ERP_MAPPED: req.body.IS_ERP_MAPPED ? '1' : '0',
        S_TEACHER_ATTENDANCE_ENABLED: req.body.S_TEACHER_ATTENDANCE_ENABLED ? '1' : '0',
        C_TEACHER_ATTENDANCE_ENABLED: req.body.C_TEACHER_ATTENDANCE_ENABLED ? '1' : '0',
        STEP_NO: req.body.STEP_NO,
        INSTITUTE_LOGO: req.body.INSTITUTE_LOGO,
        SLOGAN: req.body.SLOGAN,
        
        SHORT_CODE: req.body.SHORT_CODE,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}
function reqUserData(req) {
    var data = {
        ID: req.body.PRINCIPLE_ID,
        NAME: req.body.PRINCIPLE_NAME,
        EMAIL_ID: req.body.EMAIL_ID,
        MOBILE_NUMBER: req.body.PHONE_NUMBER,
        IS_ACTIVE: "1",
        PASSWORD: req.body.PASSWORD,
        CLIENT_ID: req.body.CLIENT_ID,
    }
    return data;
}
exports.validate = function () {
    return [

        body('COUNTRY_ID').isInt().optional(), body('STATE_ID').optional(), body('SCHOOL_NAME').optional(), body('ADDRESS').optional(), body('PINCODE').optional(), body('PHONE_NUMBER').optional(), body('PRINCIPLE_NAME').optional(), body('EMAIL_ID').optional(), body('UPI_ID').optional(), body('PASSWORD').optional(), body('SEQ_NO').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewSchoolMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get schoolMaster count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewSchoolMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get schoolMaster information."
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
            mm.executeQueryData('INSERT INTO ' + schoolMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save schoolMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "SCHOOL_ID": results.insertId,
                        "message": "SchoolMaster information saved successfully...",
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
            if (data.STATE_ID == "" || data.STATE_ID == null) {
                setData += ` STATE_ID = ? ,`
                recordData.push(null)
            }
            if (data.DISTRICT_ID == "" || data.DISTRICT_ID == null) {
                setData += ` DISTRICT_ID = ? ,`
                recordData.push(null)
            }
            mm.executeQueryData(`UPDATE ` + schoolMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update schoolMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "SchoolMaster information updated successfully...",
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

    var PRINCIPLE_NAME = req.body.PRINCIPLE_NAME
    var EMAIL_ID = req.body.EMAIL_ID
    var MOBILE_NUMBER = req.body.PHONE_NUMBER
    var PASSWORD = req.body.PASSWORD

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
            mm.executeDML('SELECT ID from user_master where EMAIL_ID = ? OR MOBILE_NUMBER = ?', [EMAIL_ID, MOBILE_NUMBER], supportKey, connection, (error, resultschek) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to save schoolMaster information..."
                    });
                }
                else {
                    if (resultschek.length > 0 && resultschek[0].ID > 0) {
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 300,
                            "message": "Email or Mobile number already exist..."
                        });
                    } else {
                        mm.executeDML('INSERT INTO user_master (ROLE_ID,NAME,EMAIL_ID,MOBILE_NUMBER,IS_ACTIVE,PASSWORD,CLIENT_ID) values (?,?,?,?,?,?,?) ', [2, PRINCIPLE_NAME, EMAIL_ID, MOBILE_NUMBER, 1, PASSWORD, 1], supportKey, connection, (error, results) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save schoolMaster information..."
                                });
                            }
                            else {
                                data.PRINCIPLE_ID = results.insertId
                                mm.executeDML('INSERT INTO ' + schoolMaster + ' SET ?', data, supportKey, connection, (error, results1) => {
                                    if (error) {
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to save schoolMaster information..."
                                        });
                                    }
                                    else {
                                        mm.commitConnection(connection);
                                        res.send({
                                            "code": 200,
                                            "message": "SchoolMaster information saved successfully...",
                                            "SCHOOL_ID": results1.insertId
                                        });
                                    }
                                });
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
exports.updateSchool = (req, res) => {
    const errors = validationResult(req);
    //console.log(req.body);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ID,
    };
    var EMAIL_ID = req.body.EMAIL_ID
    var MOBILE_NUMBER = req.body.PHONE_NUMBER
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });

    var userData = reqUserData(req)
    var setUserData = "";
    var recordUserData = [];
    Object.keys(userData).forEach(key => {
        userData[key] ? setUserData += `${key}= ? , ` : true;
        userData[key] ? recordUserData.push(userData[key]) : true;
    });
    var PRINCIPLE_ID = req.body.PRINCIPLE_ID
    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {

            if (data.STATE_ID == "" || data.STATE_ID == null) {
                setData += ` STATE_ID = ? ,`
                recordData.push(null)
            }
            if (data.DISTRICT_ID == "" || data.DISTRICT_ID == null) {
                setData += ` DISTRICT_ID = ? ,`
                recordData.push(null)
            }
            if (data.INSTITUTE_LOGO == "" || data.INSTITUTE_LOGO == null) {
                setData += ` INSTITUTE_LOGO = ? ,`
                recordData.push(null)
            }
            const connection = mm.openConnection()
            mm.executeDML('SELECT ID from school_master where ID != ? AND (EMAIL_ID = ? OR PHONE_NUMBER = ?)', [criteria.ID, EMAIL_ID, MOBILE_NUMBER], supportKey, connection, (error, resultschek) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to save schoolMaster information..."
                    });
                }
                else {
                    if (resultschek.length > 0 && resultschek[0].ID > 0) {
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 300,
                            "message": "Email or Mobile number already exist..."
                        });
                    } else {
                        mm.executeDML(`UPDATE ` + schoolMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                            if (error) {

                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to update schoolMaster information."
                                });
                            }
                            else {
                                mm.executeDML(`UPDATE user_master SET ${setUserData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${PRINCIPLE_ID} `, recordUserData, supportKey, connection, (error, results) => {
                                    if (error) {

                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to update schoolMaster information."
                                        });
                                    }
                                    else {
                                        mm.commitConnection(connection);
                                        res.send({
                                            "code": 200,
                                            "message": "SchoolMaster information updated successfully...",
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}
exports.sendRegistrationOTP = (req, res) => {
    var EMAIL_ID = req.body.EMAIL_ID
    var supportKey = req.headers['supportkey'];
    var systemDate = mm.getSystemDate()
    try {
        var OTP = 123456;
        // var otp = Math.floor(100000 + Math.random() * 900000);
        var body = `${OTP} is your Login OTP, Please do not share this OTP with anyone.`;
        const connection = mm.openConnection()
        if (EMAIL_ID && EMAIL_ID != " ") {
            mm.executeDML('SELECT ID FROM view_user_master WHERE  EMAIL_ID =? AND IS_ACTIVE = 1;SELECT ID FROM view_school_master WHERE  PHONE_NUMBER = ? ', [EMAIL_ID, EMAIL_ID], supportKey, connection, (error, results) => {
                if (error) {
                    console.log(error);
                    mm.rollbackConnection(connection)
                    res.send({
                        "code": 400,
                        "message": "Failed to get Committee Information.",
                    });
                }
                else {
                    var userData = [...results[0], ...results[1]];
                    console.log(userData);
                    if (userData.length > 0 || userData[0]?.ID != null || userData[0]?.ID > 0) {
                        mm.rollbackConnection(connection)
                        console.log(error);
                        res.send({
                            "code": 300,
                            "message": "Email already exist.",
                        });
                    }
                    else {
                        mm.executeDML('INSERT INTO  REGISTRATION_OTP_DETAILS (EMAIL_ID,TYPE,OTP,OTP_MESSAGE,REQUESTED_DATETIME,CLIENT_ID,STATUS,IS_EMAIL_VERIFIED) VALUES (?,?,?,?,?,?,?,?)', [EMAIL_ID, 'E', OTP, body, systemDate, 1, 1, 0], supportKey, connection, (error, resultsOtp2) => {
                            if (error) {
                                console.log(error);
                                mm.rollbackConnection(connection)
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save Registration Details."
                                });
                            } else {

                                mm.sendEmail(EMAIL_ID, 'Registration OTP', body, (error, resultsMail2) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log('mail send success');
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
                }
            })
        }
        else {
            mm.commitConnection(connection)
            res.send({
                "code": 302,
                "message": "Email should not be blank.",
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

exports.verifyRegistrationOTP = (req, res) => {

    var EMAIL_ID = req.body.EMAIL_ID
    var OTP = req.body.OTP
    var supportKey = req.headers['supportkey'];
    var systemDate = mm.getSystemDate();
    try {

        if (OTP && OTP != '' && EMAIL_ID && EMAIL_ID != '') {
            mm.executeQueryData('SELECT ID,OTP FROM registration_otp_details WHERE EMAIL_ID =? ORDER BY ID DESC LIMIT 1', [EMAIL_ID], supportKey, (error, results1) => {
                if (error) {
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to get Registration Details.",
                    });
                } else {
                    if (results1[0].OTP == OTP) {
                        mm.executeQueryData(`UPDATE registration_otp_details SET IS_EMAIL_VERIFIED = 1,EMAIL_VERIFICATION_DATETIME = ? WHERE ID = ?`, [systemDate, results1[0]?.ID], supportKey, (error, results) => {
                            if (error) {
                                console.log(error);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get record...",
                                });
                            }
                            else {
                                res.send({
                                    "code": 200,
                                    "message": "SUCESS."
                                });
                            }
                        });
                    }
                    else {
                        console.log(error);
                        res.send({
                            "code": 300,
                            "message": "Incorrect Email OTP. Please enter valid OTP.",
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

exports.approveReject = (req, res) => {
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
    var SCHOOL_STATUS = req.body.SCHOOL_STATUS
    var PRINCIPLE_NAME = req.body.PRINCIPLE_NAME
    var PHONE_NUMBER = req.body.PHONE_NUMBER
    var EMAIL_ID = req.body.EMAIL_ID

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
            mm.executeDML(`UPDATE ` + schoolMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update schoolMaster information."
                    });
                }
                else {
                    if (SCHOOL_STATUS == "A") {
                        mm.executeDML('INSERT INTO user_master (ROLE_ID,NAME,EMAIL_ID,MOBILE_NUMBER,IS_ACTIVE,PASSWORD,CLIENT_ID) values (?,?,?,?,?,?,?) ', [2, PRINCIPLE_NAME, EMAIL_ID, PHONE_NUMBER, 1, data.PASSWORD, 1], supportKey, connection, (error, results) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save user information..."
                                });
                            }
                            else {
                                mm.commitConnection(connection);
                                res.send({
                                    "code": 200,
                                    "message": "school information updated successfully..."
                                });

                                var TITLE = `Your School Registration Application has been approved.`
                                var DESCRIPTION = `Dear ${PRINCIPLE_NAME},

                                                            Congratulations!
                                                            Your School Registration Application has been approved. By Inspector please check the below details.
                                                                
                                                            Best regards,
                                                            TRACKK team`
                                var wparams = [{
                                    "type": "text",
                                    "text": TITLE
                                }]
                                // mm.sendWSMS(PHONE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                                //     if (error) {
                                //         console.log(error);
                                //     }
                                //     else {
                                //         console.log('Whatsapp message sent to :' + PHONE_NUMBER);
                                //     }
                                // })
                                // mm.sendEmail(EMAIL_ID, TITLE, DESCRIPTION, (error, resultsMail2) => {
                                //     if (error) {
                                //         console.log(error);
                                //     }
                                //     else {
                                //         console.log("Mail sent successfully ... ");
                                //     }
                                // })
                            }
                        });
                    } else if (SCHOOL_STATUS == "R") {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "school information updated successfully..."
                        });

                        var TITLE = `Your School Restration Application Rejected By Admin`
                        var DESCRIPTION = `Dear ${PRINCIPLE_NAME},

                                                    Your School Application Rejected By Admin please check and reupload
                                                    Remark : ${data.REJECT_BLOCKED_REMARK}

                                                    Thank you for your cooperation, and we look forward to serving you better in the future.

                                                    Best regards,
                                                    TRACKK team`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        // mm.sendWSMS(PHONE_NUMBER, 'genric_otp', wparams, 'en_US', body, (error, wSms) => {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        //     else {
                        //         console.log('Whatsapp message sent to :' + PHONE_NUMBER);
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
                            "code": 402,
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
                "message": "Something Went Wrong..."
            });
        }
    }
}
exports.getCount = (req, res) => {

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
        mm.executeQuery('SELECT COUNT(ID) AS ALL_COUNT,COUNT(IF(SCHOOL_STATUS="A",1,null)) AS APPROVED,COUNT(IF(SCHOOL_STATUS="R",1,null)) AS REJECTED,COUNT(IF(SCHOOL_STATUS="P",1,null)) AS PENDING,COUNT(IF(SCHOOL_STATUS="B",1,null)) AS BLOCKED from school_master  where 1 ' + criteria, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get schoolMaster information."
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
            "message": "Something Went Wrong..."
        });
    }
}

exports.updateStep = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var ID = req.body.ID
    var STEP_NO = req.body.STEP_NO
    var systemDate = mm.getSystemDate();

    try {
        mm.executeQueryData(`SELECT STEP_NO from school_master where ID =? `, [ID], supportKey, (error, results) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                res.send({
                    "code": 400,
                    "message": "Failed to update schoolMaster information."
                });
            }
            else {
                if (results[0]?.STEP_NO > STEP_NO) {
                    STEP_NO = results[0]?.STEP_NO
                }
                mm.executeQueryData(`UPDATE school_master SET STEP_NO = ?, CREATED_MODIFIED_DATE = ? where ID = ? `, [STEP_NO, systemDate, ID], supportKey, (error, results) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        res.send({
                            "code": 400,
                            "message": "Failed to update schoolMaster information."
                        });
                    }
                    else {
                        res.send({
                            "code": 200,
                            "message": "SchoolMaster information updated successfully...",
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