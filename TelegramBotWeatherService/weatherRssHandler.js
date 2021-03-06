var connection = require("./dbConnection");
var telegramBotHandler = require("./telegramBotHandler");
var feedparser = require('feedparser-promised');
var selectSubSql = {}
selectSubSql["WeatherWarningBulletin_uc"] = "select * from member where subscribe = 'W'";
selectSubSql["WeatherWarningBulletin"] = "select * from member where subscribe = 'W'";
selectSubSql["CurrentWeather_uc"] = "select * from member where subscribe = 'C'";
selectSubSql["CurrentWeather"] = "select * from member where subscribe = 'C'";


function updateRss(url, callback, chatId){
  feedparser.parse(url).then(function (items) {
    var func = url.substring(url.indexOf('rss/')+4,url.indexOf('.xml'));
    var item = items[0];
    callback(func, item, chatId);
  }).catch(function (error) {
    console.log('error: ', error);
  });
}
function checkRss(func, item){
  var selectSql = 'select * from rss_log where ?';
  var data = {rss_func: func};
  connection.query(selectSql, data, function(error, rows){
      //檢查是否有錯誤
      if(error){
          throw error;
      }
      if(rows.length > 0){
        var row = rows[0];
        //有更新
        if(row.rss_datetime != item.date.toString()){
          console.log(func,item.title);
          console.log(row.rss_datetime);
          console.log(item.date);
          var updateSql = 'update rss_log set ? where rss_func = \''+func+'\'';
          var data = {rss_datetime: item.date};
          connection.query(updateSql, data, function(err){
            if(err){
              throw err;
            }
          });
          sendUpdate(func, genText(func, item));
        }
      }else{
        var insertSql = 'insert into rss_log set ?';
        var data = {rss_func: func, rss_datetime: item.date};
        connection.query(insertSql, data, function(err){
          if(err){
            throw err;
          }
        });
        sendUpdate(func, genText(func, item));
      }
    });
}

function sendRss(func, item, chatId){
  console.log('func: ', func, 'title: ', item.title);
  telegramBotHandler.sendMessage(chatId,genText(func, item));
}

function genText(func, item){
  var text = '';
  var title = item.title;
  var summary = item.summary;
  if(func == 'CurrentWeather_uc'){
    summary = summary.substring(summary.indexOf('<br/><br/>')+10,summary.indexOf('<p></p>'))
  }
  summary = removeHTML(summary);
  text = title + '\n' + summary;
  console.log(text);
  return text;
}

function removeHTML(strText) {
  var reqBr = /<br\/>/g;
  strText = strText.replace(reqBr,"\n");
  var regEx = /<[^>]*>|\t|\r\n| /g;
  return strText.replace(regEx, "");
}

function sendUpdate(func, text){
  //查詢有訂閱的使用者
  connection.query(selectSubSql[func], null, function(error, rows){
    if(error){
      throw error;
    }
    if(rows.length > 0){
      rows.forEach(function (row){
        telegramBotHandler.sendMessage(row.chat_id,text);
      });
    }
  });
}

exports.updateRss = updateRss;
exports.checkRss = checkRss;
exports.sendRss = sendRss;
