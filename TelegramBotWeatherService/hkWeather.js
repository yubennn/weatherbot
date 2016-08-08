var feedparser = require('feedparser-promised');

function updateRss(url, callback, chatId){
  feedparser.parse(url).then(function (items) {
    var func = url.substring(url.indexOf('rss/')+4,url.indexOf('.xml'));
    var item = items[0];
    callback(func, item, chatId);
    // items.forEach(function (item) {
    //   console.log('title: ', item.title);
    // });
  }).catch(function (error) {
    console.log('error: ', error);
  });
}

exports.updateRss = updateRss;
