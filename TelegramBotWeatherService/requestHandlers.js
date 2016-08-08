var querystring = require("querystring");
var fs = require("fs");
var formidable = require("formidable");
var connection = require("./dbConnection");
var HongKongWeather = require('hongkong-weather');
var hkweather = require("./hkＷeather");
var weatherRssHandler = require("./weatherRssHandler");
var telegramBotUtil = require("./telegramBotUtil");

function start(response, request) {
  console.log("Request handler 'start' was called.");

  var chatId = request.body.message.chat.id;
  var text = 'WeatherService is a bot can notify users who subscribed to new weather updates. \n'+
              'Or you can use command to query the weather \n'+
              ' \n'+
              ' \n'+
              '/subscribewarning - The bot will send message to the user on new warning \n'+
              '/unsubscribewarning - The bot will not send update to user from now on \n'+
              '/tellmecurrent - Provide the current weather report \n'+
              '/tellmewarning - Provide the weather warning \n';
   telegramBotUtil.sendMessage(chatId, text);
   response.end();
}

function subscribewarning(response, request) {
  var chatId = request.body.message.chat.id;
  //查詢該使用者是否已訂購過
  var selectSql = 'select 1 from member where ?';
  var data = {chat_id: chatId};
  connection.query(selectSql, data,function(error, rows){
      //檢查是否有錯誤
      if(error){
          throw error;
      }
      if(rows.length > 0){
        //使用者存在則更新註記
        var updateSql = 'update member set subscribe = "Y" where ?';
        connection.query(updateSql, data, function (err) {
            if (err) {
              throw err;
            }
        });
      }else{
        //使用者不存在則新增使用者
        var insertSql = 'insert into member set ?';
        var data = {
          chat_id:chatId,
          first_name:request.body.message.chat.first_name,
          username:request.body.message.chat.username,
          subscribe:'Y'
        };
        connection.query(insertSql, data, function (err) {
            if (err) {
              throw err;
            }
        });
      }
  });
  response.end();
}

function unsubscribewarning(response, request) {
  var chatId = request.body.message.chat.id;
  //查詢該使用者是否已訂購過
  var selectSql = 'select 1 from member where ?';
  var data = {chat_id: chatId};
  connection.query(selectSql, data,function(error, rows){
      //檢查是否有錯誤
      if(error){
          throw error;
      }
      if(rows.length > 0){
        //使用者存在則更新註記
        var updateSql = 'update member set subscribe = "N" where ?';
        connection.query(updateSql, data, function (err) {
            if (err) {
              throw err;
            }
        });
      }
  });
  response.end();
}

function tellmecurrent(response, request) {
  var chatId = request.body.message.chat.id;
  hkweather.updateRss('http://rss.weather.gov.hk/rss/CurrentWeather_uc.xml', weatherRssHandler.sendRss, chatId);
  response.end();
}

function tellmewarning(response, request) {
  var chatId = request.body.message.chat.id;
  hkweather.updateRss('http://rss.weather.gov.hk/rss/WeatherWarningBulletin_uc.xml', weatherRssHandler.sendRss, chatId);
  response.end();
}


exports.start = start;
exports.subscribewarning = subscribewarning;
exports.unsubscribewarning = unsubscribewarning;
exports.tellmecurrent = tellmecurrent;
exports.tellmewarning = tellmewarning;
