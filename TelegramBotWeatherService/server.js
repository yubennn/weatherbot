//express https server
var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var telegramBotUtil = require("./telegramBotUtil");
var privateKey = fs.readFileSync(__dirname+'/../PRIVATE.key');
var certificate = fs.readFileSync(__dirname+'/../PUBLIC.pem');
var credentials = {key: privateKey, cert: certificate};
var app = express();
var httpsServer = https.createServer(credentials, app);
// server = https.createServer(credentials, app).listen(8443);
var server =  httpsServer.listen(8443, function(){
  timeout(1);
});
app.use(bodyParser.json());
//requesthandlers
var requestHandlers = require("./requestHandlers");
var handle = {}
handle["/start"] = requestHandlers.start;
handle["/subscribewarning"] = requestHandlers.subscribewarning;
handle["/unsubscribewarning"] = requestHandlers.unsubscribewarning;
handle["/tellmecurrent"] = requestHandlers.tellmecurrent;
handle["/tellmewarning"] = requestHandlers.tellmewarning;
//hkweather rss
var hkweather = require("./hkWeather");
var weatherRssHandler = require("./weatherRssHandler");
function timeout(offset){
  setTimeout(function () {
    //get update message from telegram
    var res = telegramBotUtil.updateMessage(offset);
    hkweather.updateRss('http://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml', weatherRssHandler.checkRss);
    timeout(res+1);
  },1000*2);
}
//get router for setWebhook
app.post('/', function(req, res){
  'use strict';
  //check method field exist
  if(!req.body.message || !req.body.message.text){
    res.send("There is not data coming!!");
  }else{
    var method = req.body.message.text;
    if (typeof handle[method] === 'function') {
      console.log("Method: " + method);
      handle[method](req.body);
    } else {
      console.log("No request handler found for " + method);
      res.writeHead(404, {"Content-Type": "text/html"});
      res.write("404 Not found");
      res.end();
    }
    res.end();
  }
});
