const mm = require('../Utilities/globalModule');
const { validationResult, body } = require('express-validator');
const logger = require("../Utilities/logger");

const applicationkey = process.env.APPLICATION_KEY;

var tableName = "global_settings";
var viewTableName = "view_" + tableName;

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
        mm.executeQuery('select count(*) as cnt from ' + viewTableName + ' where 1 ' + countCriteria, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                res.send({
                    "code": 400,
                    "message": "error occurred",
                });
            }
            else {
                mm.executeQuery('select * from ' + viewTableName + ' where 1 ' + criteria, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                        res.send({
                            "code": 400,
                            "message": "error occurred"
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
        console.log(error);
        logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
    }
}


exports.getVersion = (req, res) => {
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`select VALUE from global_settings where KEYWORD ='MIN_VERSION' `, supportKey, (error, results1) => {
            if (error) {
                console.log(error);
                logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                res.send({
                    "code": 400,
                    "message": "error occurred"
                });
            }
            else {
                mm.executeQuery(`select VALUE from global_settings where KEYWORD ='CUR_VERSION' `, supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                        logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                        res.send({
                            "code": 400,
                            "message": "error occurred"
                        });
                    }
                    else {
                        mm.executeQuery(`select VALUE from global_settings where KEYWORD ='APK_LINK'`, supportKey, (error, resultsApplink) => {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                res.send({
                                    "code": 200,
                                    "message": "success",
                                    "data": [{
                                        "MIN_VERSION": results1[0]?.VALUE,
                                        "CUR_VERSION": results[0]?.VALUE,
                                        "SYSTEM_DATE": mm.getSystemDate(),
                                        "APK_LINK": resultsApplink[0]?.VALUE
                                    }]
                                });
                            }
                        })
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
    }
}


exports.updatedVersion = (req, res) => {

    //var KEYWORD = req.body.KEYWORD;
    // var VALUE = req.body.VALUE;
    var MIN_VERSION = req.body.MIN_VERSION;
    var CUR_VERSION = req.body.CUR_VERSION;
    var APK_LINK = req.body.APK_LINK ? req.body.APK_LINK : '';
    var DETOX_TIME = req.body.DETOX_TIME;
    var DETOX_DURATION = req.body.DETOX_DURATION;

    var supportKey = req.headers['supportkey'];

    //console.log(VALUE);

    try {
        var connection = mm.openConnection();
        mm.executeDML(`UPDATE ` + tableName + ` SET VALUE = ? where KEYWORD = 'MIN_VERSION' `, [MIN_VERSION], supportKey, connection, (error, results) => {
            if (error) {
                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                mm.rollbackConnection(connection);
                res.send({
                    "code": 400,
                    "message": "Failed to update APK information."
                });
            } else {
                mm.executeDML(`UPDATE ` + tableName + ` SET VALUE = ? where KEYWORD = 'CUR_VERSION' `, [CUR_VERSION], supportKey, connection, (error, results1) => {
                    if (error) {
                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                        res.send({
                            "code": 400,
                            "message": "Failed to update APK information."
                        });
                    } else {
                        mm.executeDML(`UPDATE ` + tableName + ` SET VALUE = ? where KEYWORD = 'APK_LINK' `, [APK_LINK], supportKey, connection, (error, results2) => {
                            if (error) {
                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                                mm.rollbackConnection(connection);
                                res.send({
                                    "code": 400,
                                    "message": "Failed to update APK information."
                                });
                            } else {
                                mm.executeDML(`UPDATE ` + tableName + ` SET VALUE = ? where KEYWORD = 'DETOX_DURATION' `, [DETOX_DURATION], supportKey, connection, (error, results2) => {
                                    if (error) {
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        console.log(error);
                                        mm.rollbackConnection(connection);
                                        res.send({
                                            "code": 400,
                                            "message": "Failed to update APK information."
                                        });
                                    } else {
                                        mm.executeDML(`UPDATE ` + tableName + ` SET VALUE = ? where KEYWORD = 'DETOX_TIME' `, [DETOX_TIME], supportKey, connection, (error, results2) => {
                                            if (error) {
                                                logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                                console.log(error);
                                                mm.rollbackConnection(connection);
                                                res.send({
                                                    "code": 400,
                                                    "message": "Failed to update APK information."
                                                });
                                            } else {
                                                mm.commitConnection(connection);
                                                res.send({
                                                    "code": 200,
                                                    "message": "Apk Information Updated successfully..."
                                                })
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
    } catch (error) {
        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }
}


// exports.create = (req, res) => {

//     var data = reqData(req);
//     const errors = validationResult(req);
//     var supportKey = req.headers['supportkey'];

//     if (!errors.isEmpty()) {

//         res.send({
//             "code": 422,
//             "message": errors
//         });
//     }
//     else {
//         try {
//             mm.executeQueryData('INSERT INTO ' + tableName + ' SET ?', data, supportKey, (error, results) => {
//                 if (error) {
//                     console.log(error);
//                     logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
//                     res.send({
//                         "code": 400,
//                         "message": "Database error occurred"
//                     });
//                 }
//                 else {
//                     console.log(results);
//                     res.send({
//                         "code": 200,
//                         "message": "New holiday Successfully created",
//                     });
//                 }
//             });
//         } catch (error) {
//             console.log(error);
//             logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
//         }
//     }
// }


// exports.update = (req, res) => {
//     const errors = validationResult(req);
//     var data = reqData(req);
//     var supportKey = req.headers['supportkey'];
//     var criteria = {
//         ID: req.body.ID,
//     };
//     var systemDate = mm.getSystemDate();
//     var setData = "";
//     Object.keys(data).forEach(key => {
//         data[key] ? setData += `${key}= '${data[key]}', ` : true;
//     });

//     if (!errors.isEmpty()) {
//         res.send({
//             "code": 422,
//             "message": errors
//         });
//     }
//     else {
//         try {
//             mm.executeQuery(`UPDATE ` + tableName + ` SET ${setData} CREATED_MODIFIED_DATE = '${systemDate}' where ID = ${criteria.ID} `, supportKey, (error, results) => {
//                 if (error) {
//                     console.log(error);
//                     logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
//                     res.send({
//                         "code": 400,
//                         "message": "Database error occurred"
//                     });
//                 }
//                 else {
//                     console.log(results);
//                     res.send({
//                         "code": 200,
//                         "message": "Holiday data Successfully updated",
//                     });
//                 }
//             });
//         } catch (error) {
//             console.log(error);
//             logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
//         }
//     }
// }


exports.getDetoxInfo = (req, res) => {
    var supportKey = req.headers['supportkey'];
    try {
        mm.executeQuery(`select VALUE from global_settings where KEYWORD ='DETOX_TIME' `, supportKey, (error, results) => {
            if (error) {
                console.log(error);
                logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
                res.send({
                    "code": 400,
                    "message": "error occurred"
                });
            }
            else {
                mm.executeQuery(`select VALUE from global_settings where KEYWORD ='DETOX_DURATION'`, supportKey, (error, results1) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        res.send({
                            "code": 200,
                            "message": "success",
                            "data": [{
                                "DETOX_DURATION": results1[0].VALUE,
                                "DETOX_TIME": results[0].VALUE,
                                "SYSTEM_DATE": mm.getSystemDate(),
                            }]
                        });
                    }
                })
            }
        });
    } catch (error) {
        console.log(error);
        logger.error('APIK:' + req.headers['apikey'] + ' ' + supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), req.headers['supportkey']);
    }
}