const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const xlsx = require("xlsx");
const async = require('async')

const applicationkey = process.env.APPLICATION_KEY;

var studentMaster = "student_master";
var viewStudentMaster = "view_" + studentMaster;


function reqData(req) {

    var data = {
        NAME: req.body.NAME,
        COUNTRY_ID: req.body.COUNTRY_ID,
        STATE_ID: req.body.STATE_ID,
        ROLE_ID: req.body.ROLE_ID ? req.body.ROLE_ID : 4,
        DISTRICT_ID: req.body.DISTRICT_ID,
        ADDRESS: req.body.ADDRESS,
        DOB: req.body.DOB,
        GENDER: req.body.GENDER,
        IDENTITY_NUMBER: req.body.IDENTITY_NUMBER,
        MOBILE_NUMBER: req.body.MOBILE_NUMBER,
        EMAIL_ID: req.body.EMAIL_ID,
        PASSWORD: req.body.PASSWORD,
        SEQ_NO: req.body.SEQ_NO,
        SCHOOL_ID: req.body.SCHOOL_ID,
        STATUS: req.body.STATUS ? '1' : '0',
        IS_VERIFIED: req.body.IS_VERIFIED ? '1' : '0',
        PROFILE_PHOTO: req.body.PROFILE_PHOTO,
        COUNTRY_NAME: req.body.COUNTRY_NAME,
        STATE_NAME: req.body.STATE_NAME,
        DISTRICT_NAME: req.body.DISTRICT_NAME,
        REJECT_BLOCKED_REMARK: req.body.REJECT_BLOCKED_REMARK,
        STUDENT_STATUS: req.body.STUDENT_STATUS,
        TEMP_DIVISION_ID: req.body.TEMP_DIVISION_ID,
        APP_USER_ID: req.body.APP_USER_ID,
        TEMP_CLASS_ID: req.body.TEMP_CLASS_ID,
        TEMP_MEDIUM_ID: req.body.TEMP_MEDIUM_ID,
        TEMP_ROLL_NO: req.body.TEMP_ROLL_NO,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('NAME').optional(), body('COUNTRY_ID').isInt().optional(), body('STATE_ID').optional(), body('ADDRESS').optional(), body('DOB').optional(), body('GENDER').optional(), body('IDENTITY_NUMBER').optional(), body('MOBILE_NUMBER').optional(), body('EMAIL_ID').optional(), body('PASSWORD').optional(), body('SEQ_NO').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewStudentMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get studentMasters count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewStudentMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get studentMaster information."
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
            mm.executeQueryData('INSERT INTO ' + studentMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save studentMaster information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "StudentMaster information saved successfully...",
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
            if (data.IDENTITY_NUMBER == "" || data.IDENTITY_NUMBER == null) {
                setData += ` IDENTITY_NUMBER = ? ,`
                recordData.push('')
            }
            if (data.PROFILE_PHOTO == "" || data.PROFILE_PHOTO == null) {
                setData += ` PROFILE_PHOTO = ? ,`
                recordData.push('')
            }
            mm.executeQueryData(`UPDATE ` + studentMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update studentMaster information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "StudentMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}


exports.importData = (req, res) => {

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
            mm.executeDML(`SELECT MOBILE_NUMBER,COUNT(MOBILE_NUMBER) AS COUNT FROM student_master WHERE STATUS = 1 AND MOBILE_NUMBER IN (${commaSeparatedMobileNumbers}) GROUP BY MOBILE_NUMBER HAVING COUNT(MOBILE_NUMBER) >= 2; SELECT count(ID) COUNT from student_master WHERE STATUS = 1 AND MOBILE_NUMBER in(${mobileNumbers});`, [], supportKey, connection, (error, resultsCheck) => {
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
                                var seqNo = 1;
                                if (feeDetails && feeDetails.length > 0) {
                                    async.eachSeries(studentData, function iteratorOverElems(element, callback) {
                                        mm.executeDML('Select ID from app_user_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?', [element.MOBILE_NUMBER, element.EMAIL_ID], supportKey, connection, (error, resultscheckuser) => {
                                            if (error) {
                                                console.log(error)
                                                callback(error);
                                            } else {
                                                var USER_ID = null
                                                if (resultscheckuser && resultscheckuser.length > 0 && resultscheckuser[0]?.ID != null) {
                                                    USER_ID = resultscheckuser[0].ID
                                                }
                                                mm.executeDML('INSERT INTO student_master (NAME,MOBILE_NUMBER,IDENTITY_NUMBER,GENDER,CLIENT_ID,PASSWORD,SEQ_NO,STATUS,ROLE_ID,SCHOOL_ID,STUDENT_STATUS,APP_USER_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [element.NAME, element.MOBILE_NUMBER, element.IDENTITY_NUMBER, element.GENDER, 1, "12345678", seqNo, 1, 4, SCHOOL_ID, "A", USER_ID], supportKey, connection, (error, results) => {
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
                                            }
                                        });
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


exports.promote = (req, res) => {

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
            mm.executeDML(`SELECT MOBILE_NUMBER,COUNT(MOBILE_NUMBER) AS COUNT FROM student_master WHERE STATUS = 1 AND MOBILE_NUMBER IN (${commaSeparatedMobileNumbers}) GROUP BY MOBILE_NUMBER HAVING COUNT(MOBILE_NUMBER) >= 2; SELECT count(ID) COUNT from student_master WHERE STATUS = 1 AND MOBILE_NUMBER in(${mobileNumbers})`, [], supportKey, connection, (error, resultsCheck) => {
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
                                        mm.executeDML('Select ID from app_user_master where MOBILE_NUMBER = ? OR EMAIL_ID = ?', [element.MOBILE_NUMBER, element.EMAIL_ID], supportKey, connection, (error, resultscheckuser) => {
                                            if (error) {
                                                console.log(error)
                                                callback(error);
                                            } else {
                                                var USER_ID = null
                                                if (resultscheckuser && resultscheckuser.length > 0 && resultscheckuser[0]?.ID != null) {
                                                    USER_ID = resultscheckuser[0].ID
                                                }
                                                mm.executeDML('INSERT INTO student_master (NAME,MOBILE_NUMBER,IDENTITY_NUMBER,GENDER,CLIENT_ID,PASSWORD,STATUS,ROLE_ID,SCHOOL_ID,STUDENT_STATUS,APP_USER_ID,CITY_ID,COUNTRY_ID,DISTRICT_ID,DOB,SEQ_NO,ADDRESS,STATE_ID,EMAIL_ID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [element.NAME, element.MOBILE_NUMBER, element.IDENTITY_NUMBER, element.GENDER, 1, "12345678", 1, 4, SCHOOL_ID, "A", USER_ID, element.CITY_ID, element.COUNTRY_ID, element.DISTRICT_ID, element.DOB, element.SEQ_NO, element.ADDRESS, element.STATE_ID, element.EMAIL_ID], supportKey, connection, (error, results) => {
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
                                            }
                                        });
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

exports.mapClass = (req, res) => {

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
        mm.executeQuery('SELECT COUNT(ID) AS ALL_COUNT,COUNT(IF(STUDENT_STATUS="A",1,null)) AS APPROVED,COUNT(IF(STUDENT_STATUS="R",1,null)) AS REJECTED,COUNT(IF(STUDENT_STATUS="P",1,null)) AS PENDING,COUNT(IF(STUDENT_STATUS="B",1,null)) AS BLOCKED from student_master where 1 ' + criteria, supportKey, (error, results) => {
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


exports.approveReject = (req, res) => {
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
    var STUDENT_STATUS = req.body.STUDENT_STATUS
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
            mm.executeDML(`UPDATE ` + studentMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
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
                    if (STUDENT_STATUS == "A") {
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
                                                            var TITLE = `Your School Restration Application Approved By Admin`
                                                            var DESCRIPTION = `Dear ${NAME},
        
                                                            Your School Restration Application Approved By Admin         
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
                    } else if (STUDENT_STATUS == "R") {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "school information updated successfully..."
                        });

                        var TITLE = `Your School Restration Application Rejected By Admin`
                        var DESCRIPTION = `Dear ${NAME},

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

exports.register = (req, res) => {
    var data = reqData(req);
    const errors = validationResult(req);
    var supportKey = req.headers["supportkey"];
    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            code: 422,
            message: errors.errors,
        });
    } else {
        try {
            if (data.SCHOOL_ID != null && data.SCHOOL_ID != "" && data.TEMP_CLASS_ID != null && data.TEMP_CLASS_ID != "" && data.TEMP_DIVISION_ID != null && data.TEMP_DIVISION_ID != "") {
                mm.executeQueryData("Select ID from student_master where MOBILE_NUMBER = ? OR APP_USER_ID = ?", [data.MOBILE_NUMBER, data.APP_USER_ID], supportKey, (error, Checkuser1) => {
                    if (error) {
                        console.log(errors);
                        res.send({
                            "code": 400,
                            "message": "Failed to get record...",
                        })
                    } else {
                        if (Checkuser1.length >= 2) {
                            res.send({
                                "code": 300,
                                "message": "Exeded limit...",
                            })
                        } else {
                            mm.executeQueryData('INSERT INTO ' + studentMaster + ' SET ?', data, supportKey, (error, results) => {
                                if (error) {
                                    console.log(error);
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to save studentMaster information..."
                                    });
                                }
                                else {
                                    res.send({
                                        "code": 200,
                                        "message": "StudentMaster information saved successfully...",
                                    });
                                }
                            });
                        }
                    }
                })
            } else {
                res.send({
                    "code": 300,
                    "message": "Please fill all required fields..."
                })
            }
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
            res.send({
                "code": 500,
                "message": "Something went wrong...",
            })
        }
    }
};

