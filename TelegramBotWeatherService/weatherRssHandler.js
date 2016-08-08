var connection = require("./dbConnection");
var telegramBotUtil = require("./telegramBotUtil");
var selectSubSql = {}
selectSubSql["WeatherWarningBulletin_uc"] = "select * from member where subscribe = 'Y'";

function checkRss(func, item){
  console.log('func: ', func, 'title: ', item.title);
  var selectSql = 'select * from rss_log where ?';
  console.log(selectSql);
  var data = {rss_func: func};
  connection.query(selectSql, data, function(error, rows){
      //檢查是否有錯誤
      if(error){
          throw error;
      }
      if(rows.length > 0){
      console.log(123123);
        var row = rows[0];
        //有更新
        console.log(row.rss_datetime,item.date, row.rss_datetime != item.date.toString());
        if(row.rss_datetime != item.date.toString()){
          var updateSql = 'update rss_log set ? where rss_func = \''+func+'\'';
          var data = {rss_datetime: row.rss_datetime};
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
  telegramBotUtil.sendMessage(chatId,genText(func, item));
}

function genText(func, item){
  var text = '';
  if(func == 'CurrentWeather_uc'){
    text = item.title + '\n' +
      item.summary;
  }else if(func == 'WeatherWarningBulletin_uc'){
    text = item.title + '\n' +
      // item.summary.split("<br/>").join("\n");
      item.summary;
  }
  console.log(text);
  return text;
}

function sendUpdate(func, text){
  //查詢有訂閱的使用者
  connection.query(selectSubSql[func], null, function(error, rows){
    if(error){
      throw error;
    }
    if(rows.length > 0){
      rows.forEach(function (row){
        telegramBotUtil.sendMessage(row.chat_id,text);
      });
    }
  });
}

exports.checkRss = checkRss;
exports.sendRss = sendRss;
