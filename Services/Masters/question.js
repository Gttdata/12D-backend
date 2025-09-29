const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const async = require('async')

const applicationkey = process.env.APPLICATION_KEY;

var questionMaster = "question_master";
var viewQuestionMaster = "view_" + questionMaster;


function reqData(req) {

    var data = {
        QUESTION_TYPE: req.body.QUESTION_TYPE,
        CHAPTER_ID: req.body.CHAPTER_ID,
        QUESTION: req.body.QUESTION,
        QUESTION_IMAGE: req.body.QUESTION_IMAGE,
        DESCRIPTION: req.body.DESCRIPTION,
        ANSWER: req.body.ANSWER,
        ANSWER_IMAGE: req.body.ANSWER_IMAGE,
        MARKS: req.body.MARKS,
        SEQ_NO: req.body.SEQ_NO,
        STATUS: req.body.STATUS ? '1' : '0',
        DIRECTION: req.body.DIRECTION,
        SCHOOL_ID: req.body.SCHOOL_ID,
        QUESTION_IMAGE_SIZE: req.body.QUESTION_IMAGE_SIZE,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('QUESTION_TYPE').isInt().optional(), body('CHAPTER_ID').isInt().optional(), body('QUESTION').optional(), body('QUESTION_IMAGE').optional(), body('DESCRIPTION').optional(), body('ANSWER').optional(), body('ANSWER_IMAGE').optional(), body('MARKS').optional(), body('SEQ_NO').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewQuestionMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get questionMasters count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewQuestionMaster + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get questionMaster information."
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
            mm.executeQueryData('INSERT INTO ' + questionMaster + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save questionMaster information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "QuestionMaster information saved successfully...",
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
            if (data.QUESTION_IMAGE == "" || data.QUESTION_IMAGE == null) {
                setData += ` QUESTION_IMAGE = ? ,`
                recordData.push('')
            }
            if (data.ANSWER_IMAGE == "" || data.ANSWER_IMAGE == null) {
                setData += ` ANSWER_IMAGE = ? ,`
                recordData.push('')
            }
            if (data.DESCRIPTION == "" || data.DESCRIPTION == null) {
                setData += ` DESCRIPTION = ? ,`
                recordData.push('')
            }
            mm.executeQueryData(`UPDATE ` + questionMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update questionMaster information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "QuestionMaster information updated successfully...",
                    });
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}

exports.addBulk = (req, res) => {

    var supportKey = req.headers['supportkey'];
    var QUESTION_DATA = req.body.QUESTION_DATA
    console.log(QUESTION_DATA);
    try {
        if (QUESTION_DATA && QUESTION_DATA.length > 0) {
            const connection = mm.openConnection();
            mm.executeDML(`SELECT SEQ_NO FROM question_master ORDER BY SEQ_NO DESC LIMIT 1`, [], supportKey, connection, (error, resultsSeq) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update questionMaster information."
                    });
                }
                else {
                    // var SEQ_NO = resultsSeq[0]?.SEQ_NO ? resultsSeq[0].SEQ_NO + 1 : 1
                    var SEQ_NO = (resultsSeq[0]?.SEQ_NO !== undefined && resultsSeq[0]?.SEQ_NO !== null) ? resultsSeq[0].SEQ_NO + 1 : 1;
                    async.eachSeries(QUESTION_DATA, function iteratorOverElems(element, callback) {
                        var insertData = {
                            QUESTION_TYPE: element.QUESTION_TYPE,
                            CHAPTER_ID: element.CHAPTER_ID,
                            QUESTION: element.QUESTION,
                            QUESTION_IMAGE: element.QUESTION_IMAGE,
                            DESCRIPTION: element.DESCRIPTION,
                            ANSWER: element.ANSWER,
                            ANSWER_IMAGE: element.ANSWER_IMAGE,
                            MARKS: element.MARKS,
                            SEQ_NO: SEQ_NO,
                            STATUS: element.STATUS ? '1' : '0',
                            DIRECTION: element.DIRECTION,
                            SCHOOL_ID: element.SCHOOL_ID,
                            CLIENT_ID: element.CLIENT_ID,
                            QUESTION_IMAGE_SIZE: element.QUESTION_IMAGE_SIZE,
                        };
                        var optionArray = element.OPTIONS
                        var questionType = element.QUESTION_TYPE
                        mm.executeDML('INSERT INTO ' + questionMaster + ' SET ?', insertData, supportKey, connection, (error, results) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                callback(error);
                            }
                            else {
                                SEQ_NO++
                                if (questionType == 1 || questionType == "1") {
                                    var recData = []
                                    if (optionArray.length > 0) {
                                        for (var i = 0; i < optionArray.length; i++) {
                                            var rec = [results.insertId, optionArray[i].OPTION_TEXT, optionArray[i].OPTION_IMAGE_URL, optionArray[i].IS_CORRECT ? "1" : "0", optionArray[i].SEQ_NO, optionArray[i].STATUS ? "1" : "0", element.CLIENT_ID]
                                            recData.push(rec)
                                        }
                                    }
                                    mm.executeDML(`INSERT INTO question_options_mapping (QUESTION_ID,OPTION_TEXT,OPTION_IMAGE_URL,IS_CORRECT,SEQ_NO,STATUS,CLIENT_ID) values ?`, [recData], supportKey, connection, (error, results) => {
                                        if (error) {
                                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                            console.log(error);
                                            callback(error);
                                        }
                                        else {
                                            callback();
                                        }
                                    });
                                } else {
                                    callback();
                                }
                            }
                        });
                    }, function subCb(error) {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            mm.rollbackConnection(connection)
                            res.send({
                                "code": 400,
                                "message": "Failed to update questionMaster information."
                            })
                        } else {
                            mm.commitConnection(connection)
                            res.send({
                                "code": 200,
                                "message": "questionMaster information updated successfully...",
                            })
                        }
                    });
                }
            })
        } else {
            res.send({
                "code": 400,
                "message": "No data found to update..."
            })
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
        res.send({
            "code": 500,
            "message": "Something went wrong."
        })
    }
}


exports.updateBulk = (req, res) => {
    const errors = validationResult(req);
    var optionArray = req.body.OPTIONS
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
            if (data.QUESTION_IMAGE == "" || data.QUESTION_IMAGE == null) {
                setData += ` QUESTION_IMAGE = ? ,`
                recordData.push('')
            }
            if (data.ANSWER_IMAGE == "" || data.ANSWER_IMAGE == null) {
                setData += ` ANSWER_IMAGE = ? ,`
                recordData.push('')
            }
            if (data.DESCRIPTION == "" || data.DESCRIPTION == null) {
                setData += ` DESCRIPTION = ? ,`
                recordData.push('')
            }
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE ` + questionMaster + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to update questionMaster information."
                    });
                }
                else {
                    if (data.QUESTION_TYPE == 1 || data.QUESTION_TYPE == "1") {
                        var recData = []
                        if (optionArray?.length > 0) {
                            for (var i = 0; i < optionArray.length; i++) {
                                var rec = [criteria.ID, optionArray[i].OPTION_TEXT, optionArray[i].OPTION_IMAGE_URL, optionArray[i].IS_CORRECT ? "1" : "0", optionArray[i].SEQ_NO, optionArray[i].STATUS ? "1" : "0", data.CLIENT_ID]
                                recData.push(rec)
                            }
                            mm.executeDML(`DELETE from question_options_mapping where QUESTION_ID = ${criteria.ID};INSERT INTO question_options_mapping (QUESTION_ID,OPTION_TEXT,OPTION_IMAGE_URL,IS_CORRECT,SEQ_NO,STATUS,CLIENT_ID) values ?`, [recData], supportKey, connection, (error, results) => {
                                if (error) {
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to save question_options_mapping information...",
                                    });
                                }
                                else {
                                    mm.commitConnection(connection);
                                    res.send({
                                        "code": 200,
                                        "message": "question_options_mapping information updated successfully...",
                                    });
                                }
                            });
                        } else {
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 300,
                                "message": "optionArray cannot be null",
                            })
                        }
                    } else {
                        mm.commitConnection(connection);
                        res.send({
                            "code": 200,
                            "message": "questionMaster information updated successfully...",
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

exports.getChapterList = (req, res) => {

    var pageIndex = req.body.pageIndex ? req.body.pageIndex : '';

    var pageSize = req.body.pageSize ? req.body.pageSize : '';
    var start = 0;
    var end = 0;

    if (pageIndex != '' && pageSize != '') {
        start = (pageIndex - 1) * pageSize;
        end = pageSize;
    }

    let sortKey = req.body.sortKey ? req.body.sortKey : 'CHAPTER_ID';
    let sortValue = req.body.sortValue ? req.body.sortValue : 'DESC';
    let filter = req.body.filter ? req.body.filter : '';

    let criteria = '';

    if (pageIndex === '' && pageSize === '')
        criteria = " GROUP BY CHAPTER_ID order by " + sortKey + " " + sortValue;
    else
        criteria = " GROUP BY CHAPTER_ID order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;
    // if (pageIndex === '' && pageSize === '')
    //     criteria = filter + " GROUP BY CHAPTER_ID order by " + sortKey + " " + sortValue;
    // else
    //     criteria = filter + " GROUP BY CHAPTER_ID order by " + sortKey + " " + sortValue + " LIMIT " + start + "," + end;

    let countCriteria = filter;
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery('select count(DISTINCT CHAPTER_ID) as cnt from ' + viewQuestionMaster + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get questionMasters count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery(`SELECT JSON_ARRAYAGG(JSON_OBJECT('QUESTION_TYPE', QUESTION_TYPE, 'QUESTION_TYPE_NAME', QUESTION_TYPE_NAME, 'QUESTION_TYPE_SEQ_NO', QUESTION_TYPE_SEQ_NO)) AS QUESTION_TYPES, CHAPTER_ID, CHAPTER_NAME, (SELECT COUNT(*) FROM view_question_master WHERE view_question_master.CHAPTER_ID = distinct_data.CHAPTER_ID) AS QUESTION_COUNT FROM (SELECT DISTINCT QUESTION_TYPE, QUESTION_TYPE_NAME, QUESTION_TYPE_SEQ_NO, CHAPTER_ID, CHAPTER_NAME FROM view_question_master WHERE 1 ${filter}) AS distinct_data` + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get questionMaster information."
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