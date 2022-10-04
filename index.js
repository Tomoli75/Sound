const express = require('express');
const fs = require('fs');
const querystring = require('querystring');
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// initialise global vars
const trusted = ["51662Tomoli75"];

// middleware

const authElevated = function(req, res, next) {
    if (req.params.token === process.env.BACKEND_TOKEN) {
        next();
    } else {
        res.sendStatus(401);
    }
}

const auth = function(req, res, next) {
  //console.log(req.headers)
  if(req.headers["cf-connecting-ip"] == process.env.DF_IP) {
  const agent = req.headers["user-agent"];
  const plotDetails = agent.match(/\((.*)\)/g)[0].replace(/[() ]/g,"").split(",");
  req.plot = {id:plotDetails[0],author:plotDetails[1]};
  req.plot.identifier = req.plot.id+req.plot.author;
    if(trusted.includes(req.plot.identifier)) req.plot.trusted = true;
  next();
  } else {
      req.plot = {identifier:"NonDF",id:"0",author:"Unknown",trusted:false};
      next();
  }
}

const postParams = function(req, res, next) {
  req.body = req.body.replace("///","&");
  req.options = querystring.parse(req.body);
  if(typeof req.options.time !== "undefined") {
    req.options.time = parseFloat(req.options.time) * 1000;
  }
  next();
}

// sources

app.get('/yt/:id/direct.:ext', (req, res) => {
    require("./routes/sources/yt.js")(req, res);
});

app.get('/yt/:id', (req, res) => {
    res.redirect('/yt/'+req.params.id.replace(".mp3","")+'/direct.mp3');
});

app.get('/tts/:text/:voice?', (req, res) => {
    require("./routes/sources/tts.js")(req, res);
});

app.get('/glados/:text', (req, res) => {
    require("./routes/sources/glados.js")(req, res);
});

// frontend

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/web/views/player.html");
});

app.use('/static/web', express.static(__dirname + "/web/static/"));

// plot-accessible backend

app.post('/api/v1/load', auth, bodyParser.text(), postParams, (req, res) => {
  require("./routes/plots/v1/load.js")(req, res, io);
});

app.post('/api/v1/play', auth, bodyParser.text(), postParams, (req, res) => {
  require("./routes/plots/v1/simpleplay.js")(req, res, io);
});

app.post('/api/v1/stop', auth, bodyParser.text(), postParams, (req, res) => {
  require("./routes/plots/v1/stop.js")(req, res, io);
});

app.post('/api/v1/advplay', auth, bodyParser.text(), postParams, (req, res) => {
  require("./routes/plots/v1/advplay.js")(req, res, io);
});

// backend

/*
app.get('/api/management/:token/link/:username', authElevated, (req, res) => {
    require("./routes/management/link.js")(req, res, nameToLink);
});
*/

// socket routes

io.on("connection", (socket) => {
    socket.on("link", username => require("./socket_routes/link.js")(username,io,socket));
});

// listen

http.listen(1506, () => {
    console.log('ready');
});
