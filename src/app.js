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

// Start listening on a port
app.listen(8080, () => {
    console.log('Server started!');
});

/***********************************************************
** GET requests
************************************************************/

app.route('/').get((req, res) => {
    res.sendFile("./src/index.html", { root: "." });
});

app.route("/get/farmRun/").get(async (req, res) => {
    //TODO check if the g.e. has been updated so we don't spam the API
    // Save the data locally and check if x minutes have passed since last check
    const conString = `http://localhost:2254/get/farmRun`;
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

/***********************************************************
** POST requests
************************************************************/

app.route("/post/farmRun").post(function(req, res) {
    axios.post("http://localhost:2254/post/farmRun",req.body).then((reply) => {
        res.send(reply.data);
    }).catch((error) =>{
        res.sendStatus(500);
    });

    
});