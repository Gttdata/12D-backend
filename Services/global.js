const { verify } = require('jsonwebtoken');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');

exports.checkAuth = (req, res, next) => {
    try {
        var apikey = req.headers['apikey'];
        console.log(apikey);
        if (apikey == process.env.APIKEY) {
            next();
        }
        else {
            console.log(process.env.APIKEY);
            res.send({
                "code": 300,
                "message": "Access Denied...!"
            });
        }
    } catch (error) {
        console.log(error)
        res.send({
            "code": 400,
            "message": "Server not found..."
        });
    }
}

exports.checkToken = (req, res, next) => {
    let bearerHeader = req.headers['token'];
    if (typeof bearerHeader !== 'undefined') {
        verify(bearerHeader, process.env.SECRET, (err, decode) => {
            if (err) {
                res.send({
                    'code': 400,
                    'message': 'Invalid token'
                });
            }
            else {
                next();
            }
        });
    }
    else {
        res.send({
            'code': 400,
            'message': 'Access Denied...!'
        });
    }
}

exports.advertisementImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/advertisementImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.removeFile = function (req, res) {
    var fileUrl = path.join(__dirname, '../uploads/' + req.body.FILE_URL)
    try {
        if (req.body.FILE_URL && req.body.FILE_URL != '') {
            fs.unlink(fileUrl, (err) => {
                if (err) {
                    console.error(err);
                    res.send({
                        "code": 400,
                        "message": "fail to delete file."
                    })
                }
                else {
                    res.send({
                        "code": 200,
                        "message": "file delete successful."
                    })
                }
            });
        }
        else {
            res.send({
                "code": 404,
                "message": "fileUrl missing."
            })
        }
    }
    catch (err) {
        console.log(err);
    }
}

exports.classWiseTask = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/classWiseTask/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.studentExcel = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/studentExcel/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.questionImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/questionImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.answerImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/answerImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.optionImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/optionImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.taskAttachment = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/taskAttachment/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.studentProfile = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/studentProfile/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.appUserProfile = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/appUserProfile/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.teacherProfile = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/teacherProfile/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.ticketImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/ticketImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.instituteLogo = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/instituteLogo/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.activityHeadImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/activityHeadImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.activityGIF = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/activityGIF/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.taskImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/taskImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.rewardImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/rewardImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.animationVideo = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/animationVideo/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}


exports.diamentionImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/diamentionImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.activityCategoryImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/activityCategoryImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}


exports.appLogsFiles = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/appLogsFiles/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}


exports.activityThumbnailGIF = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/activityThumbnailGIF/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.templateImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/templateImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}

exports.bannerImage = function (req, res) {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldPath = files.Image.filepath;
            var newPath = path.join(__dirname, '../Uploads/bannerImage/') + files.Image.originalFilename;
            var rawData = fs.readFileSync(oldPath)
            fs.writeFile(newPath, rawData, function (err) {
                if (!err) {
                    console.log('uploaded successfully..');
                    res.send({
                        "code": 200,
                        "message": "success",
                    });
                }
                else {
                    console.log(err);
                    res.send({
                        "code": 400,
                        "message": "failed to upload.."
                    });
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}
