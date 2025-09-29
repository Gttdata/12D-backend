const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var periodTracking = "period_tracking";
var viewPeriodTracking = "view_" + periodTracking;


function reqData(req) {

    var data = {
        USER_ID: req.body.USER_ID,
        MONTH: req.body.MONTH,
        PERIOD_DAYS_LENGTH: req.body.PERIOD_DAYS_LENGTH,
        CYCLE_LENGTH: req.body.CYCLE_LENGTH,
        LAST_PERIOD_DATE: req.body.LAST_PERIOD_DATE,
        IS_REGULAR_STATUS: req.body.IS_REGULAR_STATUS,
        REMIND_DATE_TIME: req.body.REMIND_DATE_TIME,
        DAY_REMINDER_DATE: req.body.DAY_REMINDER_DATE,
        IS_REMIND: req.body.IS_REMIND ? '1' : '0',
        IS_DONE: req.body.IS_DONE ? '1' : '0',
        YEAR: req.body.YEAR,
        PERIOD_START_DATE: req.body.PERIOD_START_DATE,
        PERIOD_END_DATE: req.body.PERIOD_END_DATE,
        FERTILE_START_DATE: req.body.FERTILE_START_DATE,
        FERTILE_END_DATE: req.body.FERTILE_END_DATE,
        OVULATION_START_DATE: req.body.OVULATION_START_DATE,
        OVULATION_END_DATE: req.body.OVULATION_END_DATE,
        SAFE_START_DATE: req.body.SAFE_START_DATE,
        SAFE_END_DATE: req.body.SAFE_END_DATE,
        
        IS_QUESTIONARY_COMPLETE: req.body.IS_QUESTIONARY_COMPLETE ? '1' : '0',
        REMIND_DATE_COUNT: req.body.REMIND_DATE_COUNT,
        DAY_REMINDER_END_DATE: req.body.DAY_REMINDER_END_DATE,
        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('USER_ID').optional(),
        body('MONTH').optional(),
        body('PERIOD_DAYS_LENGTH').optional(),
        body('CYCLE_LENGTH').optional(),
        body('LAST_PERIOD_DATE').optional(),
        body('IS_REGULAR_STATUS').optional(),
        body('IS_REMIND').optional(),
        body('REMIND_DATE_TIME').optional(),
        body('DAY_REMINDER_DATE').optional(),
        body('ID').optional(),
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
        mm.executeQuery('select count(*) as cnt from ' + viewPeriodTracking + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);

                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get periodTrackings count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewPeriodTracking + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);

                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get periodTracking information."
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
            mm.executeQueryData('INSERT INTO ' + periodTracking + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save periodTracking information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "periodTracking information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + periodTracking + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {

                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update periodTracking information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "periodTracking information updated successfully...",
                    });
                }
            });
        } catch (error) {

            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}