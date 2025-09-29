const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const jwt = require('jsonwebtoken');

const applicationkey = process.env.APPLICATION_KEY;

var teacherMaster = "teacher_master";
var viewTeacherMaster = "view_" + teacherMaster;


function reqData(req) {

    var data = {
        DOB: req.body.DOB,
        GENDER: req.body.GENDER,
        NAME: req.body.NAME,
        EMAIL_ID: req.body.EMAIL_ID,
        MOBILE_NUMBER: req.body.MOBILE_NUMBER,
        PASSWORD: req.body.PASSWORD,
        SEQ_NO: req.body.SEQ_NO,
        ROLE_ID: req.body.ROLE_ID ? req.body.ROLE_ID : 3,
        STATUS: req.body.STATUS ? '1' : '0',
        SCHOOL_ID: req.body.SCHOOL_ID,
        APP_USER_ID: req.body.APP_USER_ID,
        REJECT_BLOCKED_REMARK: req.body.REJECT_BLOCKED_REMARK,
        TEACHER_STATUS: req.body.TEACHER_STATUS,
        TEMP_CLASS_ID: req.body.TEMP_CLASS_ID,
        TEMP_SUBJECT_ID: req.body.TEMP_SUBJECT_ID,
        PROFILE_PHOTO: req.body.PROFILE_PHOTO,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('DOB').optional(), body('GENDER').optional(), body('NAME').optional(), body('EMAIL_ID').optional(), body('MOBILE_NUMBER').optional(), body('PASSWORD').optional(), body('SEQ_NO').optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewTeacherMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get teacherMasters count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewTeacherMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get teacherMaster information."
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
            mm.executeQueryData('INSERT INTO ' + teacherMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save teacherMaster information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "TeacherMaster information saved successfully...",
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
            if (data.TEACHER_STATUS == 'A') {
                setData += ` REJECT_BLOCKED_REMARK = ? ,`
                recordData.push(null)
            }
            mm.executeQueryData(`UPDATE ` + teacherMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update teacherMaster information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "TeacherMaster information updated successfully...",
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
            mm.executeDML("Select ID from app_user_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?;Select ID from teacher_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?", [data.MOBILE_NUMBER, data.EMAIL_ID, data.MOBILE_NUMBER, data.EMAIL_ID], supportKey, connection, (error, Checkuser) => {
                if (error) {
                    mm.rollbackConnection(connection);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    })
                } else {
                    if (Checkuser[1].length > 0) {
                        res.send({
                            "code": 300,
                            "KEY": "OLD",
                            "message": "User Already Exist...",
                        })
                    } else {
                        if (Checkuser[0].length > 0) {
                            data.APP_USER_ID = Checkuser[0][0].ID
                        } else {
                            data.APP_USER_ID = null
                        }
                        mm.executeDML('INSERT INTO ' + teacherMaster + ' SET ?', data, supportKey, connection, (error, results) => {
                            if (error) {
                                mm.rollbackConnection(connection);
                                console.log(error);
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to save teacherMaster information..."
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

exports.updateBulk = (req, res) => {
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
                mm.executeDML(`UPDATE ` + teacherMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
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


exports.login = (req, res) => {
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
            mm.executeQuery(`SELECT * FROM ${viewTeacherMaster}  WHERE  (MOBILE_NUMBER ='${username}' or EMAIL_ID='${username}') and PASSWORD ='${password}' and STATUS = 1`, supportKey, (error, results1) => {
                if (error) {
                    console.log(error);
                    // logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    });
                }
                else {
                    if (results1.length > 0) {
                        mm.executeQueryData(`SELECT * FROM view_class_teacher_mapping WHERE  TEACHER_ID = ? AND STATUS = 1`, [results1[0].ID], supportKey, (error, resultsSchool) => {
                            if (error) {
                                console.log(error);
                                // logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get record...",
                                });
                            }
                            else {
                                var userDetails = [{
                                    teacherData: results1,
                                    classData: resultsSchool
                                }]
                                generateToken(results1[0].ID, res, userDetails);
                            }
                        });
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
        // logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
    }
}


function generateToken(userId, res, resultsUser) {
    try {
        var data = {
            "USER_ID": userId,
        }
        jwt.sign({ data }, process.env.SECRET, (error, token) => {
            if (error) {
                console.log("token error", error);
                //  logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                //logger.error('APIK' + req.headers['apikey'] + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
            }
            else {
                res.send({
                    "code": 200,
                    "message": "Logged in successfully...",
                    "data": [{
                        "token": token,
                        "UserData": resultsUser
                    }]
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers["supportkey"];
    var systemDate = mm.getSystemDate();

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            code: 422,
            message: errors.errors,
        });
    } else {
        try {
            mm.executeQueryData("Select ID from teacher_master where MOBILE_NUMBER = ? OR APP_USER_ID = ?", [data.MOBILE_NUMBER, data.APP_USER_ID], supportKey, (error, Checkuser1) => {
                if (error) {
                    console.log(errors);
                    res.send({
                        "code": 400,
                        "message": "Failed to get record...",
                    })
                } else {
                    if (Checkuser1.length > 0) {
                        res.send({
                            "code": 300,
                            "KEY": "OLD",
                            "message": "User Already Exist...",
                        })
                    } else {
                        mm.executeQueryData("INSERT INTO " + teacherMaster + " SET ?", data, supportKey, (error, results) => {
                            if (error) {
                                console.log(error);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to get record...",
                                })
                            } else {
                                res.send({
                                    "code": 200,
                                    "message": "User Registered Successfully...",
                                })
                            }
                        })
                    }
                }
            })
        } catch (error) {
            console.log("Something went wrong...", error);
            res.send({
                "code": 500,
                "message": "Something went wrong...",
            });
        }
    }
};


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
            if (data.TEACHER_STATUS == 'A') {
                setData += ` REJECT_BLOCKED_REMARK = ? ,`
                recordData.push(null)
            }
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE ` + teacherMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
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
                    if (data.TEACHER_STATUS == "A") {
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
                        var TITLE = `Your School Restration Application Approved By Admin`
                        var DESCRIPTION = `Dear ${data.NAME},
    
                                        Your School Application Application has been Approved By Admin.
    
                                        Thank you for your cooperation, and we look forward to serving you better in the future.
                                        Best regards,
                                        TRACKK team`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        mm.sendNotificationToId(data.APP_USER_ID, TITLE, DESCRIPTION, supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + data.APP_USER_ID);
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
                    } else if (data.TEACHER_STATUS == "R") {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "school information updated successfully..."
                        });

                        var TITLE = `Your School Restration Application Rejected By Admin`
                        var DESCRIPTION = `Dear ${data.NAME},

                                                    Your School Application Rejected By Admin please check and reupload
                                                    Remark : ${data.REJECT_BLOCKED_REMARK}

                                                    Thank you for your cooperation, and we look forward to serving you better in the future.

                                                    Best regards,
                                                    TRACKK team`
                        var wparams = [{
                            "type": "text",
                            "text": TITLE
                        }]
                        mm.sendNotificationToId(data.APP_USER_ID, TITLE, DESCRIPTION, supportKey, (err, notification) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('notification sent to :' + data.APP_USER_ID);
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
        mm.executeQuery('SELECT COUNT(ID) AS ALL_COUNT,COUNT(IF(TEACHER_STATUS="A",1,null)) AS APPROVED,COUNT(IF(TEACHER_STATUS="R",1,null)) AS REJECTED,COUNT(IF(TEACHER_STATUS="P",1,null)) AS PENDING,COUNT(IF(TEACHER_STATUS="B",1,null)) AS BLOCKED from teacher_master where 1' + criteria, supportKey, (error, results) => {
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

exports.updateUser = (req, res) => {
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
    var ADDRESS = req.body.ADDRESS,
        CITY_ID = req.body.CITY_ID,
        STATE_ID = req.body.STATE_ID,
        APP_USER_ID = req.body.APP_USER_ID

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQueryData(`UPDATE ` + teacherMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update teacherMaster information."
                    });
                }
                else {
                    mm.executeQueryData(`UPDATE app_user_master SET ADDRESS = ?, CITY_ID = ?, STATE_ID = ? where ID = ?`, [ADDRESS, CITY_ID, STATE_ID, APP_USER_ID], supportKey, (error, results) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            res.send({
                                "code": 400,
                                "message": "Failed to update teacherMaster information."
                            });
                        }
                        else {
                            res.send({
                                "code": 200,
                                "message": "TeacherMaster information updated successfully...",
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
                "message": "Something went wrong"
            });
        }
    }
}