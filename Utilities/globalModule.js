// const { query } = require("express");
// const express = require("express");
// const dbConfig = require("./dbConfig");
const firebase = require('../Utilities/firebase');
const mysql = require('mysql');
const request = require('request');

var applicationkey = process.env.APPLICATION_KEY

var config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: 'IST',
    multipleStatements: true,
    charset: 'UTF8MB4_GENERAL_CI',
    timeout: 20000,
    port: 3306
}


exports.executeQuery = (query, supportKey, callback) => {
    var connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query);
        connection.query(query, callback);

        //logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}


exports.executeQueryData = (query, data, supportKey, callback) => {
    var connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query, data);
        connection.query(query, data, callback);
        // dbConfig.getConnection(function (error, connection) {
        //     if (error) {
        //         console.log(error);
        //         //connection.release();
        //         throw error;
        //     }

        //     connection.on('error', function (error) {
        //         //conso
        //         throw error;
        //         return;
        //     });
        //     logger.database(query, applicationkey, supportKey);


        //     // dbConfig.end();
        // });
        //con.query(query, callback);
        //console.log(dbConfig.getDB().query(query));
        //if(JSON.stringify(query).startsWith('UPDATE'))
        //if (supportKey)
        //logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}


exports.executeQueryOld = (query, supportKey, callback) => {
    var connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query);
        connection.query(query, callback);

        //logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        // connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}


exports.executeQueryDataOld = (query, data, supportKey, callback) => {
    var connection = mysql.createConnection(config);
    // counter += 1;
    try {
        connection.connect();
        console.log(query, data);
        connection.query(query, data, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        //  connection.end();
        // dbConfig.end();
    } finally {
        connection.end();
        // dbConfig.end();
    }
}


// const lgConfig = require("../logger/loggerDbConfig");

//const { requireAuthentication } = require("../Services/hrModule/global1");
// exports.executeQueryL = (query, callback) => {
//     try {
//         console.log(query);

//         lgConfig.getDB().query(query, callback);
//     } catch (error) {
//         console.log("Exception  In : " + query + " Error : ", error);
//     }
//     finally {
//         //lgConfig.end();
//         // dbConfig.end();
//     }
//     //lgConfig.getDB().end();
// }

exports.rollbackConnection = (connection) => {
    try {
        connection.rollback(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.commitConnection = (connection) => {
    try {
        connection.commit(function () {
            connection.end();
        });
    }
    catch (error) {
        console.error(error);
    }
}

exports.openConnection = () => {
    try {
        const con = mysql.createConnection(config);
        con.connect();
        con.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
        });
        return con;
    }
    catch (error) {
        console.error(error);
    }
}

exports.executeDQL = (query, supportKey, callback) => {
    var con = this.openConnection();
    //counter += 1;
    // console.log("Counter = " + counter);
    try {
        console.log(query);

        con.query(query, callback);
        //console.log(dbConfig.getDB().query(query));
        //if(JSON.stringify(query).startsWith('UPDATE'))
        // if (supportKey)
        //     logger.database(supportKey + " " + query, supportKey);

    } catch (error) {
        console.log("Error : -" + error)
    }
    finally {
        con.end();
    }
}

exports.executeDML = (query, data, supportKey, connection, callback) => {
    try {
        console.log(query, data);
        connection.query(query, data, callback);
    } catch (error) {
        console.log("Exception  In : " + query + " Error : ", error);
        callback(error);
    } finally {
        // dbConfig.end();
    }
}

exports.getSystemDate = function () {
    let date_ob = new Date();

    // current date 
    // adjust 0 before single digit date
    let day = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);

    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);

    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
    date_cur = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return date_cur;
}

exports.geFormattedDate = function (dat1) {
    let date_ob = new Date(dat1);
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);

    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);

    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

    date_cur = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return date_cur;
}

exports.getTimeDate = function () {
    let date_ob = new Date();
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = ("0" + date_ob.getHours()).slice(-2);

    // current minutes
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);

    // current seconds
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    //console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

    date_cur = year + month + date + hours + minutes + seconds;

    return date_cur;
}

//get Intermediate dates 
exports.intermediateDates = function (startDate, endDate) {
    var startDatea = new Date(startDate); //YYYY-MM-DD
    var endDatea = new Date(endDate); //YYYY-MM-DD
    var getDateArray = function (start, end) {
        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {

            var tempDate = new Date(dt);
            let date = ("0" + tempDate.getDate()).slice(-2);
            // current month
            let month = ("0" + (tempDate.getMonth() + 1)).slice(-2);
            // current year
            let year = tempDate.getFullYear();

            arr.push(year + "-" + month + "-" + date);
            dt.setDate(dt.getDate() + 1);
        }
        console.log(arr);
        return arr;
    }
    var dateArr = getDateArray(startDatea, endDatea);
    return dateArr;
}


exports.sendEmail = (to, subject, body, callback) => {
    var request = require('request');

    var options = {
        url: process.env.GM_API + 'sendEmail',
        headers: {
            "apikey": process.env.GM_API_KEY,
            "supportkey": process.env.SUPPORT_KEY,
            "applicationkey": process.env.APPLICATION_KEY
        },
        body: {
            KEY: process.env.EMAIL_SERVER_KEY,
            TO: to,
            SUBJECT: subject,
            BODY: body
        },
        json: true
    }

    request.post(options, (error, response, body) => {
        if (error) {
            console.log("request error -send email ", error);
            callback("EMAIL SEND ERROR.");
        } else {
            console.log(body);
            callback(null, "EMAIL SEND");
        }
    });
}

/// send sms
exports.sendSMS = (to, body, callback) => {
    const request = require('request');
    var options = {
        url: process.env.GM_API + 'sendSms',
        headers: {
            "apikey": process.env.GM_API_KEY,
            "supportkey": process.env.SUPPORT_KEY,
            "applicationkey": process.env.APPLICATION_KEY
        },
        body: {
            KEY: body.search(/otp/i) ? process.env.SMS_SERVER_KEY_OTP : process.env.SMS_SERVER_KEY,
            TO: to,
            BODY: String.raw`${body}`//body
        },
        json: true
    };

    request.post(options, (error, response, body) => {
        if (error) {
            callback(error);
        } else {
            console.log("bdoy: ", response.body);
            if (response.body.code == 400)
                callback("SMS SEND ERROR." + JSON.stringify(body));
            else
                callback(null, "SMS SEND : " + JSON.stringify(body))
        }
    });
}

exports.sendWSMS = (to, template_name, PARAMETERS, callback) => {
    const request = require('request');
    var options = {
        url: process.env.GM_API + 'sendWSms',
        headers: {
            "apikey": process.env.GM_API_KEY,
            "supportkey": process.env.SUPPORT_KEY,
            "applicationkey": process.env.APPLICATION_KEY
        },
        body: {
            W_SMS_KEY: process.env.W_SMS_KEY,
            SEND_TO: to,
            template_name: template_name,//body
            PARAMETERS: PARAMETERS
        },
        json: true
    };
    request.post(options, (error, response, body) => {
        if (error) {
            callback(error);
        } else {
            console.log("wsms body: ", body);
            callback(null, body)
        }
    });
}

exports.sendNotificationToId = (ID, TITLE, DESCRIPTION, REMIND_TYPE, element, supportKey, callback) => {
    try {
        this.executeQueryData("SELECT CLOUD_ID FROM app_user_master WHERE ID=?", [ID], supportKey, (error, result) => {
            if (error) {
                callback(error)
                console.log(error);
            }
            else {
                this.executeQueryData("INSERT INTO notification_master (OWNER_TYPE,TITLE,DESCRIPTION,ATTACHMENT,SHARING_TYPE,USER_ID,CREATED_MODIFIED_DATE,CLIENT_ID,IS_PANEL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ["U", TITLE, DESCRIPTION, '', '', ID, this.getSystemDate(), 1, 0], supportKey, (error, resulti) => {
                    if (error) {
                        callback(error)
                        console.log(error);
                    }
                    else {
                        callback(null)
                        if (result[0]?.CLOUD_ID != '') {
                            firebase.generateNotification("", result[0].CLOUD_ID, "A", TITLE, DESCRIPTION, REMIND_TYPE, element, '', '', '', '9');
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.log("Exception In: " + query + " Error : ", error);
    }
}


exports.sendWAToolSMS = (MOBILE_NO, TEMPLATE_NAME, wparams, TEMP_LANG, callback) => {
    var supportKey = ['supportkey'];
    var options = {
        url: process.env.WA_TOOLS_PLATFORM_URL,
        headers: {
            apikey: process.env.WA_TOOLS_PLATFORM_API_KEY,
        },
        body: {
            API_KEY: process.env.WA_TOOLS_CLIENT_API_KEY,
            WP_CLIENT_ID: process.env.WA_TOOLS_CLIENT_ID,
            TEMPLATE_NAME: TEMPLATE_NAME,
            MOBILE_NO: MOBILE_NO,
            TEMP_PARA: wparams,
            TEMP_LANG: TEMP_LANG
        },
        json: true
    };

    request.post(options, (error, response, body) => {
        var SEND_TO = options.body.MOBILE_NO
        var PARAMS = JSON.stringify(options.body.TEMP_PARA)
        if (error) {
            console.log(error);
        }
        else {
            console.log("bdoy: ", response.body);
            console.log(error);

            if (response.body.code == 200) {
                this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO,PARAMS,TEMPLATE_NAME,MEDIA_LINK,STATUS,RESPONSE_DATA,CLIENT_ID) VALUE (?,?,?,?,?,"?",1)`, [SEND_TO, PARAMS, TEMPLATE_NAME, '', 'S', body], supportKey, (error, result) => {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(null, body);
                    }
                })
            } else {
                this.executeQueryData(`INSERT INTO whatsapp_messages_history (SENT_TO,PARAMS,TEMPLATE_NAME,MEDIA_LINK,STATUS,RESPONSE_DATA,CLIENT_ID) VALUE (?,?,?,?,?,"?",1)`, [SEND_TO, PARAMS, TEMPLATE_NAME, '', 'F', body], supportKey, (error, result) => {
                    if (error) {
                        callback(error);
                    }
                    else {
                        callback(error);
                    }
                })

            }
        }
    });
}

exports.sendNotificationAlarm = (ID, TITLE, DESCRIPTION, REMIND_TYPE, element, supportKey, callback) => {
    try {
        this.executeQueryData("SELECT CLOUD_ID FROM app_user_master WHERE ID=?", [ID], supportKey, (error, result) => {
            if (error) {
                callback(error)
                console.log(error);
            }
            else {
                this.executeQueryData("INSERT INTO notification_master (OWNER_TYPE,TITLE,DESCRIPTION,ATTACHMENT,SHARING_TYPE,USER_ID,CREATED_MODIFIED_DATE,CLIENT_ID,IS_PANEL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ["U", TITLE, DESCRIPTION, '', '', ID, this.getSystemDate(), 1, 0], supportKey, (error, resulti) => {
                    if (error) {
                        callback(error)
                        console.log(error);
                    }
                    else {
                        callback(null)
                        if (result[0]?.CLOUD_ID != '') {
                            firebase.generateAlarmNotification("", result[0].CLOUD_ID, "A", TITLE, DESCRIPTION, REMIND_TYPE, element, '', '', '', '9');
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.log("Exception In: " + query + " Error : ", error);
    }
}
