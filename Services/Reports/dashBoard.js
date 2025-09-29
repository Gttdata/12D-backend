const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

exports.getAllCount = (req, res) => {

    // var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';
    // var pageSize = req.body.pageSize ? req.body.pageSize : '';
    // var start = 0;
    // var end = 0;

    // if (pageIndex != '' && pageSize != '') {
    //     start = (pageIndex - 1) * pageSize;
    //     end = pageSize;
    // }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'SUBJECT_ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    // if (pageIndex === '' && pageSize === '')
    criteria = filter + " GROUP BY SUBJECT_ID order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;
    var SCHOOL_ID = req.body.SCHOOL_ID
    var filterSchool = '';
    if (SCHOOL_ID != '' && SCHOOL_ID != null) {
        filterSchool = `AND SCHOOL_ID IN (${SCHOOL_ID})`;
    }
    var YEAR_ID = req.body.YEAR_ID
    var filterYear = '';
    if (YEAR_ID != '' && YEAR_ID != null) {
        filterYear = `AND YEAR_ID IN (${YEAR_ID})`;
    }

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`SELECT
                            (SELECT COUNT(ID) FROM view_app_user_master WHERE ROLE = "T" AND APPROVAL_STATUS = "A" AND STATUS = 1 ${filterSchool} ${filterYear}) AS TEACHER_COUNT,
                            (SELECT COUNT(ID) FROM view_app_user_master WHERE ROLE = "S" AND APPROVAL_STATUS = "A" AND STATUS = 1 ${filterSchool} ${filterYear}) AS STUDENT_COUNT,
                            (SELECT COUNT(ID) FROM view_create_class WHERE STATUS = 1 ${filterSchool} ${filterYear}) AS CLASS_COUNT,
                            (SELECT COUNT(ID) FROM view_medium_master WHERE STATUS = 1 ${filterSchool} ${filterYear}) AS MEDIUM_COUNT,
                            (SELECT COUNT(ID) FROM view_create_division WHERE STATUS = 1 ${filterSchool} ${filterYear}) AS DIVISION_COUNT,
                            (SELECT COUNT(ID) FROM view_fee_head_master WHERE STATUS = 1 ${filterSchool} ${filterYear}) AS FEE_HEAD_COUNT,
                            (SELECT COUNT(ID) FROM view_subject_master WHERE STATUS = 1 ${filterSchool} ${filterYear}) AS SUBJECT_COUNT;
    ` , supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceDetails information."
                });
            }
            else {
                res.send({
                    "code": 200,
                    "message": "success",
                    "data": {
                        "TEACHER_COUNT": results[0]?.TEACHER_COUNT,
                        "STUDENT_COUNT": results[0]?.STUDENT_COUNT,
                        "CLASS_COUNT": results[0]?.CLASS_COUNT,
                        "MEDIUM_COUNT": results[0]?.MEDIUM_COUNT,
                        "DIVISION_COUNT": results[0]?.DIVISION_COUNT,
                        "FEE_HEAD_COUNT": results[0]?.FEE_HEAD_COUNT,
                        "SUBJECT_COUNT": results[0]?.SUBJECT_COUNT
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

exports.classWiseFeeCount = (req, res) => {

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
    var SCHOOL_ID = req.body.SCHOOL_ID
    var filterSchool = '';
    if (SCHOOL_ID != '' && SCHOOL_ID != null) {
        filterSchool = `AND SCHOOL_ID IN (${SCHOOL_ID})`;
    }

    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`SELECT SUM(PAID_FEE) TOTAL_COLLECTED,SUM(PENDING_FEE) TOTAL_PENDING,COUNT( DISTINCT(CLASS_ID)) TOTAL_CLASSES from view_student_fee_master where 1 ${criteria}`, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get attendanceDetails information."
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

exports.taskStatus = (req, res) => {

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

    let sortKey = req.body.sortKey ? req.body.sortKey : 'm.CLASS_ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    if (pageIndex === '' && pageSize === '')
        criteria = filter + " GROUP BY m.CLASS_ID,  m.CLASS_NAME order by " + sortKey + " " + sortValue;
    else
        criteria = filter + " GROUP BY m.CLASS_ID,  m.CLASS_NAME order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select m.CLASS_ID, m.CLASS_NAME,COUNT(m.CLASS_ID)TASK_COUNT,(SELECT COUNT(ID) from view_student_task_details where CLASS_ID = m.CLASS_ID AND STATUS = "C") AS COMPLETED,(SELECT COUNT(ID) from view_student_task_details where CLASS_ID = m.CLASS_ID AND STATUS = "P") AS PENDING from view_classwise_task m where m.STATUS = "A" ' + criteria, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get classwiseTask information."
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
    }

}