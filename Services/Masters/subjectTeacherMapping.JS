const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var subjectTeacherMapping = "subject_teacher_mapping";
var viewSubjectTeacherMapping = "view_" + subjectTeacherMapping;


function reqData(req) {

    var data = {
        TEACHER_ID: req.body.TEACHER_ID,
        CLASS_ID: req.body.CLASS_ID,
        YEAR_ID: req.body.YEAR_ID,
        DIVISION_ID: req.body.DIVISION_ID,
        SUBJECT_ID: req.body.SUBJECT_ID,
        STATUS: req.body.STATUS ? '1' : '0',

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}


exports.validate = function () {
    return [

        body('TEACHER_ID').isInt().optional(), body('CLASS_ID').isInt().optional(), body('YEAR_ID').isInt().optional(), body('DIVISION_ID').isInt().optional(), body('SUBJECT_ID').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewSubjectTeacherMapping + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get subjectTeacherMappings count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewSubjectTeacherMapping + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get subjectTeacherMapping information."
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
            mm.executeQueryData('INSERT INTO ' + subjectTeacherMapping + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save subjectTeacherMapping information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "SubjectTeacherMapping information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + subjectTeacherMapping + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update subjectTeacherMapping information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "SubjectTeacherMapping information updated successfully...",
                    });
                }
            });
        } catch (error) {
            
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}


exports.mapBulkSubject = (req, res) => {
    var supportKey = req.headers['supportkey'];
    var SUBJECT_DETAILS = req.body.SUBJECT_DETAILS;
    var CLASS_ID = req.body.CLASS_ID;
    var YEAR_ID = req.body.YEAR_ID;
    var DIVISION_ID = req.body.DIVISION_ID;
    var CLASS_TEACHER_ID = req.body.CLASS_TEACHER_ID;
    try {
        if (SUBJECT_DETAILS.length > 0) {
            var recData = [];
            for (let i = 0; i < SUBJECT_DETAILS.length; i++) {
                var element = SUBJECT_DETAILS[i]
                var rec = [element.TEACHER_ID, CLASS_ID, YEAR_ID, DIVISION_ID, element.SUBJECT_ID, 1, 1]
                recData.push(rec)
            }
            const connection = mm.openConnection();
            mm.executeDML(`DELETE FROM subject_teacher_mapping where CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?;DELETE FROM CLASS_TEACHER_MAPPING where CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID = ?;`, [CLASS_ID, YEAR_ID, DIVISION_ID, CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to create subject_teacher_mapping information."
                    });
                }
                else {
                    mm.executeDML(`INSERT INTO class_teacher_mapping (TEACHER_ID,CLASS_ID,YEAR_ID,DIVISION_ID,STATUS,CLIENT_ID) values (?,?,?,?,?,?)`, [CLASS_TEACHER_ID, CLASS_ID, YEAR_ID, DIVISION_ID, 1, 1], supportKey, connection, (error, results) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to create subject_teacher_mapping information."
                            });
                        }
                        else {
                            mm.executeDML(`INSERT INTO subject_teacher_mapping (TEACHER_ID,CLASS_ID,YEAR_ID,DIVISION_ID,SUBJECT_ID,STATUS,CLIENT_ID) values ?`, [recData], supportKey, connection, (error, results) => {
                                if (error) {
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to create subject_teacher_mapping information."
                                    });
                                }
                                else {
                                    mm.commitConnection(connection);
                                    res.send({
                                        "code": 200,
                                        "message": "subject_teacher_mapping information updated successfully...",
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.send({
                "code": 300,
                "message": "Please provide Subject details...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}