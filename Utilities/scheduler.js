var scheduler = require('node-schedule');
const mm = require('../Utilities/globalModule');
const db = require('../Utilities/globalModule');
const logger = require("../Utilities/logger");
const async = require('async');

exports.schedulerJob = (req, res) => {
    try {
        console.log("scheduler started");
        var j = scheduler.scheduleJob(" */1 * * * *", getSchedulerMaster);
    } catch (error) {
        console.log(error);
    }
}

var log = "schedularLog";

function getSchedulerMaster() {
    try {

        console.log("scheduled on " + new Date().toString());
        var systemdate = mm.getSystemDate();
        var dateTime = systemdate.toString().split(' ');
        var todayDate = new Date(systemdate);

        var dayName = todayDate.toString().split(' ')[0];
        var date = dateTime[0].split('-');
        var time = dateTime[1].split(':');

        var dhours = ("0" + todayDate.getHours()).slice(-2) + ':00:00';

        var dmin = '00:' + ("0" + todayDate.getMinutes()).slice(-2) + ':' + ("0" + todayDate.getSeconds()).slice(-2);
        var dsec = '00:' + '00:' + ("0" + todayDate.getSeconds()).slice(-2);


        var query = `select * from view_scheduler_master where  STATUS = 'A' AND ((REPEAT_MODE = 'C' AND REPEAT_DATA = '${dateTime[1]}') or (REPEAT_MODE = 'H' AND REPEAT_DATA = '${dateTime[1]}') or (REPEAT_MODE = 'N' AND REPEAT_DATA = '${dateTime[1]}') or (TIME = '${dateTime[1]}' AND ( (REPEAT_MODE = 'D') OR (REPEAT_MODE = 'W' AND REPEAT_DATA ='${dayName}') OR (REPEAT_MODE = 'M' AND REPEAT_DATA = '${date[2]}') OR (REPEAT_MODE = 'Y' AND REPEAT_DATA = '${date[1]}-${date[2]}') OR (REPEAT_MODE = 'S' AND REPEAT_DATA = '${dateTime[0]}'))))`;

        mm.executeQuery(query, log, (error, results) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(results);


                var timeObject = new Date(systemdate);
                var milliseconds = 60 * 1000; // 10 seconds = 10000 milliseconds
                timeObject = new Date(timeObject.getTime() + milliseconds);
                var hours = ("0" + timeObject.getHours()).slice(-2);

                // current minutes	
                var minutes = ("0" + timeObject.getMinutes()).slice(-2);

                // current seconds
                var seconds = ("0" + timeObject.getSeconds()).slice(-2);
                var curTime = hours + ":" + minutes + ":" + seconds;


                mm.executeQuery(`update scheduler_master set REPEAT_DATA = '${curTime}'  WHERE  REPEAT_MODE= 'N' AND STATUS ='A'`, log, (error, resultsUpdateIsFetched) => {
                    if (error) {
                        console.log("Error in last 1 : ", error);

                    }
                    else {
                        if (results.length > 0) {
                            for (let i = 0; i < results.length; i++) {
                                var record = results[i];
                                executeTask(record);
                            }
                        }
                        else {
                            console.log('No record');
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function executeTask(data) {

    var supportKey = "schedular"

    switch (data.NOTIFICATION_TYPE_ID) {

        case 1:
            // member todo
            var systemDate = mm.getSystemDate()
            try {
                mm.executeQueryData('SELECT * from view_member_todo WHERE IS_REMIND = 1 AND REMIND_DATETIME = ?', [systemDate], supportKey, (error, results) => {
                    if (error) {
                        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                    }
                    else {
                        async.eachSeries(results, function iteratorOverElems(element, callback) {
                            mm.sendNotificationAlarm(element.MEMBER_ID, element.TITLE, element.DESCRIPTION, element.REMIND_TYPE, JSON.stringify(element), supportKey, (err, notification) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback()
                                }
                            })
                        }, function subCb(error) {
                            if (error) {
                                // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                console.log(error);
                            } else {
                                console.log("success");
                            }
                        });
                    }
                })
            } catch (error) {
                console.log(error);
            }
            break;

        case 2:
            // assign tasks
            assignTasks();

            break;

        case 3:
            // period tracking
            var systemDate = mm.getSystemDate()
            try {
                mm.executeQueryData('SELECT * from view_period_tracking WHERE IS_REMIND = 1 AND REMIND_DATE_TIME = ?', [systemDate], supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        async.eachSeries(results, function iteratorOverElems(element, callback) {
                            mm.sendNotificationToId(element.USER_ID, "", "", "RPT", JSON.stringify(element), supportKey, (err, notification) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback()
                                }
                            })
                        }, function subCb(error) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("success");
                            }
                        });
                    }
                })
            } catch (error) {
                console.log(error);
            }
            break;

        case 4:
            // period tracking
            var systemDate = mm.getSystemDate()
            try {
                mm.executeQueryData('SELECT * from view_period_tracking WHERE IS_REMIND = 1 AND  DAY_REMINDER_DATE <= DAY_REMINDER_END_DATE AND IS_DONE = 0', [systemDate.split(" ")[0] + " 00:00:00"], supportKey, (error, results) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        async.eachSeries(results, function iteratorOverElems(element, callback) {
                            mm.sendNotificationToId(element.USER_ID, "", "", "DPT", JSON.stringify(element), supportKey, (err, notification) => {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback()
                                }
                            })
                        }, function subCb(error) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("success");
                            }
                        });
                    }
                })
            } catch (error) {
                console.log(error);
            }
            break;

        case 5:
            //Task Reminder
            mm.executeQueryData(`SELECT USER_ID, USER_NAME, LABEL FROM view_user_trackbook WHERE DATE(ASSIGNED_DATE) = CURRENT_DATE AND DISABLE_TIMING IS NOT NULL`, [], supportKey, (error, results) => {
                if (error) {
                    console.log("Case 5 Error", error);
                }
                else {
                    if (results.length == 0 || !results) {
                        console.log("No Data Found in Case 5");
                    } else {
                        results.forEach(element => {
                            var TITLE = `Gentle Reminder!`
                            var DESCRIPTION = `Dear ${element.USER_NAME},
                            Complete your task, ${element.LABEL}, before the deadline.`

                            mm.sendNotificationToId(element.USER_ID, TITLE, DESCRIPTION, "TC", JSON.stringify(element), supportKey, (err, notification) => {
                                if (err) {
                                    console.log("Case 5 Error", err);
                                } else {
                                    console.log("success");
                                }
                            })
                        });
                        console.log("Case 5 Success");
                    }
                }
            })
            break;

        case 6:
            // subscription expiry reminder
            mm.executeQueryData(`SELECT DISTINCT USER_ID,USER_NAME from view_user_subscription_details WHERE IS_TRACKBOOK_STARTED = 1 AND EXPIRE_DATE >= CURRENT_DATE`, [], supportKey, (error, results) => {
                if (error) {
                    console.log("Case 6 Error", error);
                }
                else {
                    if (results.length == 0 || !results) {
                        console.log("No Data Found in Case 6");
                    } else {
                        results.forEach(element => {
                            var TITLE = `Gentle Reminder!`
                            var DESCRIPTION = `Dear ${element.USER_NAME},
                            Your subscription is about to expire.`

                            mm.sendNotificationToId(element.USER_ID, TITLE, DESCRIPTION, "TC", JSON.stringify(element), supportKey, (err, notification) => {
                                if (err) {
                                    console.log("Case 6 Error", err);
                                } else {
                                    // console.log("success");
                                }
                            })
                        });
                        console.log("Case 6 Success");
                    }
                }
            })
            break;
        case 7:
            //  challenge complition message
            shootMessage();
            break;

        default:
            break;
    }
}

const assignTasks = () => {
    let supportKey = 'scheduler';
    try {
        const connection = mm.openConnection();
        mm.executeDML('SELECT IS_SUNDAY_OFF,TASK_ID,USER_ID,ASSIGNED_DATE,DATE_DIFFERENCE,ENABLE_TIME,DISABLE_TIMING,SUBSCRIPTION_DETAILS_ID,DATE_ADD(ASSIGNED_DATE,INTERVAL DATE_DIFFERENCE DAY) AS NEW_DATE from view_user_trackbook WHERE SUBSCRIPTION_START_DATE <= CURRENT_DATE AND SUBSCRIPTION_END_DATE > CURRENT_DATE AND DATE(ASSIGNED_DATE) = CURRENT_DATE', '', supportKey, connection, (error, results) => {
            if (error) {
                // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                mm.rollbackConnection(connection);
            }
            else {
                async.eachSeries(results, function iteratorOverElems(element, callback) {

                    let inserDate = element.NEW_DATE
                    let newDate = new Date(element.NEW_DATE);
                    let day = newDate.getDay()
                    if (day == 0 && element.IS_SUNDAY_OFF == 1) {
                        inserDate = new Date(newDate.setDate(newDate.getDate() + 1)).toISOString().slice(0, 19).replace('T', ' ');
                    }

                    mm.executeDML('INSERT INTO user_trackbook (TASK_ID,USER_ID,ASSIGNED_DATE,DATE_DIFFERENCE,ENABLE_TIME,DISABLE_TIMING,STATUS,CLIENT_ID,SUBSCRIPTION_DETAILS_ID) VALUES (?,?,?,?,?,?,?,?,?)', [element.TASK_ID, element.USER_ID, inserDate, element.DATE_DIFFERENCE, element.ENABLE_TIME, element.DISABLE_TIMING, 0, 1, element.SUBSCRIPTION_DETAILS_ID], supportKey, connection, (error, results) => {
                        if (error) {
                            callback(error);
                        }
                        else {
                            callback();
                        }
                    });

                }, function subCb(error) {
                    if (error) {
                        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                    } else {
                        console.log("success");
                        mm.commitConnection(connection);
                    }
                });
            }
        })
    } catch (error) {
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }
}

const shootMessage = () => {
    let supportKey = 'scheduler';
    try {
        const connection = mm.openConnection();
        mm.executeDML('SELECT USER_SUBSCRIPTION_ID,MOBILE_NUMBER FROM view_user_subscription_details WHERE END_DATE = CURRENT_DATE;', '', supportKey, connection, (error, results) => {
            if (error) {
                // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                console.log(error);
                mm.rollbackConnection(connection);
            }
            else {
                async.eachSeries(results, function iteratorOverElems(element, callback) {
                    mm.executeDML('SELECT COUNT(ID) as CNT FROM view_user_trackbook WHERE STATUS != "D" AND USER_SUBSCRIPTION_ID = ?;', [element.USER_SUBSCRIPTION_ID], supportKey, connection, (error, results) => {
                        if (error) {
                            // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                            console.log(error);
                            mm.rollbackConnection(connection);
                        }
                        else {
                            if (results[0].CNT == 0) {
                                var wparams = [
                                    {
                                        "type": "body",
                                        "parameters": [
                                            {
                                                "type": "text",
                                                "text": "Shree"
                                            },
                                            {
                                                "type": "text",
                                                "text": "Collage Corner, Sangli - 416416"
                                            },
                                            {
                                                "type": "text",
                                                "text": "OFF20"
                                            },
                                            {
                                                "type": "text",
                                                "text": "20"
                                            },
                                        ]
                                    }
                                ]

                                mm.sendWAToolSMS("91" + element.MOBILE_NUMBER, "challenge_completed", wparams, 'en', (error, resultswsms) => {
                                    if (error) {
                                        console.log(error);
                                        logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                                        // res.send({
                                        //     "code": 400,
                                        //     "message": "Failed to send OTP.",
                                        // })
                                    }
                                    else {
                                        console.log(" whatsapp msg send : ", resultswsms)
                                        // res.send({
                                        //     "code": 200,
                                        //     "message": "success",
                                        //     "data": resultswsms
                                        // })
                                    }
                                })
                            } else {
                                callback();
                            }
                        }
                    })
                }, function subCb(error) {
                    if (error) {
                        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
                        console.log(error);
                        mm.rollbackConnection(connection);
                    } else {
                        console.log("success");
                        mm.commitConnection(connection);
                    }
                });
            }
        })
    } catch (error) {
        // logger.error(supportKey + ' ' + req.method + " " + req.url + ' ' + JSON.stringify(error), applicationkey);
        console.log(error);
    }
}