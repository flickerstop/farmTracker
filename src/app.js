const express = require("express");
const bodyParser = require("body-parser");
const console = require("./modules/console");
const request = require("request-promise");
const axios = require('axios');
const path = require("path");
const fs = require("fs-extra");

// setup the express server
const app = express();
app.use(bodyParser.json());

// Allows access to the public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }))

let versionNum = null;
const apiServer = "http://localhost:2254";

// Start listening on a port
app.listen(8080, () => {
    console.log('Server started!');
});

/***********************************************************
** GET requests
************************************************************/
//FIXME check for SQL injection or people trying to bypass the front end validation (probably add to API)
//TODO add anti-spam
app.route('/').get((req, res) => {
    res.sendFile("./src/index.html", { root: "." });
});

app.route("/get/farmRun/prices").get(async (req, res) => {
    //TODO check if the g.e. has been updated so we don't spam the API
    // Save the data locally and check if x minutes have passed since last check
    const conString = apiServer+`/get/farmRun/prices`;
    let temp = await request(conString);
    res.send(temp);
});

app.route("/get/version/").get(async (req, res) => {
    if(versionNum == null){
        versionNum = fs.readJSONSync("./src/json/versionNum.json");
        versionNum.patch++;
        fs.writeJSONSync("./src/json/versionNum.json", versionNum);
    }
    res.send(versionNum);
});

app.route('/get/farmRun/runs/:key').get((req, res) => {
    const requestedKey = req.params['key'];
    request(apiServer+"/get/farmRun/runs/"+requestedKey).then((runs) =>{
        res.send(runs);
    }).catch((err)=>{
        res.send(err);
    });
});

/***********************************************************
** POST requests
************************************************************/

app.route("/post/farmRun").post(function(req, res) {
    axios.post(apiServer+"/post/farmRun",req.body).then((reply) => {
        res.send(reply.data);
    }).catch((error) =>{
        res.sendStatus(500);
    });
});