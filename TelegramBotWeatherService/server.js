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
  updateRssBatch(0);
});
//監視天氣警報
function updateRssBatch(res){
  hkweather.updateRss('http://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml', weatherRssHandler.checkRss);
  hkweather.updateRss('http://rss.weather.gov.hk/rss/CurrentWeather_uc.xml', weatherRssHandler.checkRss);
  getUpdateMessage(res);
}
//取得新訊息
function getUpdateMessage(offset){
  setTimeout(function () {
    //get update message from telegram
    telegramBotUtil.updateMessage(offset, updateRssBatch);
  },1000*2);
}
app.use(bodyParser.json());


//以下for setWebhook
//requesthandlerso
var requestHandlers = require("./requestHandlers");
var handle = {}
handle["/start"] = requestHandlers.start;
handle["/subscribewarning"] = requestHandlers.subscribewarning;
handle["/unsubscribewarning"] = requestHandlers.unsubscribewarning;
handle["/subscribecurrent"] = requestHandlers.subscribecurrent;
handle["/unsubscribecurrent"] = requestHandlers.unsubscribecurrent;
handle["/tellmecurrent"] = requestHandlers.tellmecurrent;
handle["/tellmewarning"] = requestHandlers.tellmewarning;
//hkweather rss
var hkweather = require("./hkWeather");
var weatherRssHandler = require("./weatherRssHandler");
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
