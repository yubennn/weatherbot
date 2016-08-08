//express https server
var http = require('http');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var privateKey = fs.readFileSync(__dirname+'/../my-bot-cert.key');
var certificate = fs.readFileSync(__dirname+'/../my-public-cert.pem');
var credentials = {key: privateKey, cert: certificate};
var app = express();
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
// server = https.createServer(credentials, app).listen(8443);
httpsServer.listen(process.env.PORT || 5000,function(){
  hkweather.updateRss('http://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml', weatherRssHandler.checkRss);
  timeout();
});
app.use(bodyParser.urlencoded({ extended: true }));
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
function timeout(){
  setTimeout(function () {
    // hkweather.updateRss('http://rss.weather.gov.hk/rss/CurrentWeather_uc.xml', weatherRssHandler.checkRss);
    hkweather.updateRss('http://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml', weatherRssHandler.checkRss);
    timeout();
  },1000*5);
}
//get router
app.post('/', function(req, res){
  'use strict';
  //check method field exist
  if(!req.body.message || !req.body.message.text){
    res.send("There is not data coming!!");
  }else{
    var method = req.body.message.text;
    if (typeof handle[method] === 'function') {
      console.log("Method: " + method);
      handle[method](res, req);
    } else {
      console.log("No request handler found for " + method);
      response.writeHead(404, {"Content-Type": "text/html"});
      response.write("404 Not found");
      response.end();
    }
  }
});
