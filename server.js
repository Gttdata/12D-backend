const express = require("express");
const app = express();
var formidable = require("formidable");
exports.dotenv = require("dotenv").config();
exports.applicationkey = process.env.APPLICATION_KEY;
const logger = require("./Utilities/logger");
const globalRoute = require("./Routes/global");
const path = require("path");
const http = require("http");
const https = require("https");
const server = http.createServer(app);
var fs = require("fs");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');

const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const database = process.env.MYSQL_DATABASE;



let cors = require("cors");
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(cors());
app.use("/static", express.static("./uploads/"));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/", globalRoute);
require('./Utilities/scheduler').schedulerJob();

server.listen(port, hostname, () => {
  console.log("12dimenstions app listening on ", hostname+":"+port, "!");
  console.log("Connected Database : ", database, "!");
});
