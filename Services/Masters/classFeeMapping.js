const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");
const { TaskQueue } = require('firebase-admin/functions');

const applicationkey = process.env.APPLICATION_KEY;

var classFeeMapping = "class_fee_mapping";
var viewClassFeeMapping = "view_" + classFeeMapping;

function reqData(req) {

    var data = {
        HEAD_ID: req.body.HEAD_ID,
        CLASS_ID: req.body.CLASS_ID,
        YEAR_ID: req.body.YEAR_ID,
        DIVISION_ID: req.body.DIVISION_ID,
        IS_ACTIVE: req.body.IS_ACTIVE ? '1' : '0',
        AMOUNT: req.body.AMOUNT ? req.body.AMOUNT : 0,

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}

exports.validate = function () {
    return [

        body('HEAD_ID').isInt().optional(), body('CLASS_ID').isInt().optional(), body('YEAR_ID').isInt().optional(), body('DIVISION_ID').isInt().optional(), body('AMOUNT').isDecimal().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewClassFeeMapping + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get classFeeMapping count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewClassFeeMapping + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get classFeeMapping information."
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
            mm.executeQueryData('INSERT INTO ' + classFeeMapping + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save classFeeMapping information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "ClassFeeMapping information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + classFeeMapping + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update classFeeMapping information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "ClassFeeMapping information updated successfully...",
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

    var supportKey = req.headers['supportkey'];

    var feeDetails = req.body.feeDetails
    var CLASS_ID = req.body.CLASS_ID,
        YEAR_ID = req.body.YEAR_ID,
        TOTAL_FEES = req.body.TOTAL_FEES,
        DIVISION_ID = req.body.DIVISION_ID;

    try {
        if (feeDetails.length > 0) {
            var recData = [];
            for (let i = 0; i < feeDetails.length; i++) {
                var element = feeDetails[i]
                var rec = [element.HEAD_ID, CLASS_ID, YEAR_ID, element.DIVISION_ID, 1, element.AMOUNT, 1]
                recData.push(rec)
            }
            const connection = mm.openConnection();
            mm.executeDML(`UPDATE create_class SET IS_FEE_MAPPED = 1, TOTAL_FEES = ? WHERE ID = ? `, [TOTAL_FEES, CLASS_ID], supportKey, connection, (error, results) => {
                if (error) {
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    mm.rollbackConnection(connection);
                    res.send({
                        "code": 400,
                        "message": "Failed to create class_fee_mapping information."
                    });
                }
                else {
                    mm.executeDML(`DELETE FROM class_fee_mapping where CLASS_ID = ? AND YEAR_ID = ? AND DIVISION_ID IN (?);`, [CLASS_ID, YEAR_ID, DIVISION_ID], supportKey, connection, (error, results) => {
                        if (error) {
                            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                            res.send({
                                "code": 400,
                                "message": "Failed to create class_fee_mapping information."
                            });
                        }
                        else {
                            mm.executeDML(`INSERT INTO class_fee_mapping (HEAD_ID,CLASS_ID,YEAR_ID,DIVISION_ID,IS_ACTIVE,AMOUNT,CLIENT_ID) values ?`, [recData], supportKey, connection, (error, results) => {
                                if (error) {
                                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                    console.log(error);
                                    mm.rollbackConnection(connection);
                                    res.send({
                                        "code": 400,
                                        "message": "Failed to create class_fee_mapping information."
                                    });
                                }
                                else {
                                    mm.commitConnection(connection);
                                    res.send({
                                        "code": 200,
                                        "message": "class_fee_mapping information updated successfully...",
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
                "message": "Please provide fee details...",
            });
        }
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error)
    }
}


