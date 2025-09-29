const mm = require('../../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var schoolRegistration = "school_registration";
var viewSchoolRegistration = "view_" + schoolRegistration;


function reqData(req) {

    var data = {
        COUNTRY_ID: req.body.COUNTRY_ID,
        STATE_ID: req.body.STATE_ID,
        DISTRICT_ID: req.body.DISTRICT_ID,
        CITY_ID: req.body.CITY_ID,
        SCHOOL_NAME: req.body.SCHOOL_NAME,
        ROLE_ID: req.body.ROLE_ID,
        ADDRESS: req.body.ADDRESS,
        PINCODE: req.body.PINCODE,
        PHONE_NUMBER: req.body.PHONE_NUMBER,
        PRINCIPLE_NAME: req.body.PRINCIPLE_NAME,
        EMAIL_ID: req.body.EMAIL_ID,
        UPI_ID: req.body.UPI_ID,
        PASSWORD: req.body.PASSWORD,
        SEQ_NO: req.body.SEQ_NO,
        STATUS: req.body.STATUS ? '1' : '0',

        CLIENT_ID: req.body.CLIENT_ID

    }
    return data;
}



exports.validate = function () {
    return [

        body('COUNTRY_ID').isInt().optional(), body('STATE_ID').isInt().optional(), body('DISTRICT_ID').isInt().optional(), body('CITY_ID').isInt().optional(), body('SCHOOL_NAME').optional(), body('ROLE_ID').isInt().optional(), body('ADDRESS').optional(), body('PINCODE').isInt().optional(), body('PHONE_NUMBER').optional(), body('PRINCIPLE_NAME').optional(), body('EMAIL_ID').optional(), body('UPI_ID').optional(), body('PASSWORD').optional(), body('SEQ_NO').isInt().optional(), body('ID').optional(),


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
        mm.executeQuery('select count(*) as cnt from ' + viewSchoolRegistration + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                res.send({
                    "code": 400,
                    "message": "Failed to get schoolRegistrations count.",
                });
            }
            else {
                console.log(results1);
                mm.executeQuery('select * from ' + viewSchoolRegistration + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        res.send({
                            "code": 400,
                            "message": "Failed to get schoolRegistration information."
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
            mm.executeQueryData('INSERT INTO ' + schoolRegistration + ' SET ?', data, supportKey, (error, results) => {
                if (error) {
                    console.log(error);
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    res.send({
                        "code": 400,
                        "message": "Failed to save schoolRegistration information..."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "SchoolRegistration information saved successfully...",
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
            mm.executeQueryData(`UPDATE ` + schoolRegistration + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, recordData, supportKey, (error, results) => {
                if (error) {
                    
                    logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                    console.log(error);
                    res.send({
                        "code": 400,
                        "message": "Failed to update schoolRegistration information."
                    });
                }
                else {
                    console.log(results);
                    res.send({
                        "code": 200,
                        "message": "SchoolRegistration information updated successfully...",
                    });
                }
            });
        } catch (error) {
            
            logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
            console.log(error);
        }
    }
}