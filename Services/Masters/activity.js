const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var activityMaster = "activity_master";
var viewActivityMaster = "view_" + activityMaster;


function reqData(req) {

    var data = {
        // HEAD_ID: req.body.HEAD_ID,
        ACTIVITY_NAME: req.body.ACTIVITY_NAME,
        ACTIVITY_GIF: req.body.ACTIVITY_GIF,
        // ACTIVITY_TYPE: req.body.ACTIVITY_TYPE,
        // ACTIVITY_TIMING: req.body.ACTIVITY_TIMING,
        // ACTIVITY_SET: req.body.ACTIVITY_SET,
        SEQ_NO: req.body.SEQ_NO,
        DESCRIPTION: req.body.DESCRIPTION,
        CATEGORY: req.body.CATEGORY,

        CLIENT_ID: req.body.CLIENT_ID,
        ACTIVITY_CATEGORY_ID: req.body.ACTIVITY_CATEGORY_ID,
        ACTIVITY_SUB_CATEGORY_ID: req.body.ACTIVITY_SUB_CATEGORY_ID,
        ACTIVITY_THUMBNAIL_GIF: req.body.ACTIVITY_THUMBNAIL_GIF,
        STATUS: req.body.STATUS ? '1' : '0',
    }
    return data;
}



exports.validate = function () {
    return [

        body('ACTIVITY_NAME').optional(), body('ACTIVITY_GIF').optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewActivityMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get activityMaster count.",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewActivityMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get activityMaster information."
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
            mm.executeQueryData('INSERT INTO ' + activityMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save activityMaster information..."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityMaster information saved successfully...",
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
            if (data.ACTIVITY_TIMING == "" || data.ACTIVITY_TIMING == null) {
                setData += ` ACTIVITY_TIMING = ? ,`
                recordData.push('')
            }
            if (data.ACTIVITY_SET == "" || data.ACTIVITY_SET == null) {
                setData += ` ACTIVITY_SET = ? ,`
                recordData.push('')
            }
            mm.executeQueryData(`UPDATE ` + activityMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update activityMaster information."
                    });
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "ActivityMaster information updated successfully...",
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
    let HEAD_ID = req.body.HEAD_ID
    let ACTIVITY_TYPE = req.body.ACTIVITY_TYPE
    let ACTIVITY_VALUE = req.body.ACTIVITY_VALUE
    // let ACTIVITY_CATEGORY_ID = req.body.ACTIVITY_CATEGORY_ID
    // let ACTIVITY_SUB_CATEGORY_ID = req.body.ACTIVITY_SUB_CATEGORY_ID
    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQueryData('INSERT INTO ' + activityMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save activityMaster information..."
                    });
                }
                else {
                    mm.executeQueryData('INSERT INTO activity_head_mapping(HEAD_ID,ACTIVITY_ID,ACTIVITY_TYPE,ACTIVITY_VALUE,CLIENT_ID) VALUES (?,?,?,?,?,?,?)', [HEAD_ID, results.insertId, ACTIVITY_TYPE, ACTIVITY_VALUE, data.CLIENT_ID], supportKey, (error, results1) => {
                        if (error) {
                            console.log(error);
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            res.send({
                                "code": 400,
                                "message": "Failed to save activityMapping information..."
                            });
                        }
                        else {
                            res.send({
                                "code": 200,
                                "message": "ActivityMaster information saved successfully...",
                            });
                        }
                    });
                }
            });
        } catch (error) {
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error)
        }
    }
}

exports.modify = (req, res) => {
    const errors = validationResult(req);
    var data = reqData(req);
    var supportKey = req.headers['supportkey'];
    var criteria = {
        ID: req.body.ACTIVITY_ID,
    };
    var systemDate = mm.getSystemDate();
    var setData = "";
    var recordData = [];
    Object.keys(data).forEach(key => {
        data[key] ? setData += `${key}= ? , ` : true;
        data[key] ? recordData.push(data[key]) : true;
    });
    let ACTIVITY_MAPPING_ID = req.body.ID
    let ACTIVITY_TYPE = req.body.ACTIVITY_TYPE
    let ACTIVITY_VALUE = req.body.ACTIVITY_VALUE
    let HEAD_ID = req.body.HEAD_ID
    // let ACTIVITY_CATEGORY_ID = req.body.ACTIVITY_CATEGORY_ID
    // let ACTIVITY_SUB_CATEGORY_ID = req.body.ACTIVITY_SUB_CATEGORY_ID

    if (!errors.isEmpty()) {
        console.log(errors);
        res.send({
            "code": 422,
            "message": errors.errors
        });
    }
    else {
        try {
            mm.executeQueryData(`UPDATE ` + activityMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update activityMaster information."
                    });
                }
                else {
                    mm.executeQueryData(`UPDATE activity_head_mapping SET ACTIVITY_TYPE = ?, ACTIVITY_VALUE = ? , HEAD_ID=? where ID = ? `, [ACTIVITY_TYPE, ACTIVITY_VALUE, HEAD_ID, ACTIVITY_MAPPING_ID], supportKey, (error, results) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            res.send({
                                "code": 400,
                                "message": "Failed to update activityMaster information."
                            });
                        }
                        else {
                            res.send({
                                "code": 200,
                                "message": "ActivityMaster information updated successfully...",
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
}
