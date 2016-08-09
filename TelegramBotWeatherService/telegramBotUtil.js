var querystring = require('querystring');
var https = require('https');
var rp = require('request-promise');
var requestHandlers = require("./requestHandlers");
var handle = {}
handle["/start"] = requestHandlers.start;
handle["/subscribewarning"] = requestHandlers.subscribewarning;
handle["/unsubscribewarning"] = requestHandlers.unsubscribewarning;
handle["/tellmecurrent"] = requestHandlers.tellmecurrent;
handle["/tellmewarning"] = requestHandlers.tellmewarning;

function sendMessage(chatId, text) {
  // Build the post string from an object
  var postData = querystring.stringify({
      'chat_id' : chatId,
      'text': text
  });
  // An object of options to indicate where to post to
  var postOptions = {
      host: 'api.telegram.org',
      path: '/bot247328895:AAFvQ8H0mqHEtN_YI4qmg7qEHfx4drsDA7c/sendMessage',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
      }
  };
  // Set up the request
  var postReq = https.request(postOptions, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  // post the data
  postReq.write(postData);
  postReq.end();
}

function updateMessage(offset, callback) {
  var postOptions = {
      host: 'api.telegram.org',
      path: '/bot247328895:AAFvQ8H0mqHEtN_YI4qmg7qEHfx4drsDA7c/getUpdates?offset='+offset,
      method: 'GET'
  };
  // Set up the request
  var postReq = https.request(postOptions, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        var results = JSON.parse(chunk).result;
        results.forEach(function (result){
          var method = result.message.text;
          if(typeof handle[method] === 'function') {
            console.log("Method: " + method);
            handle[method](result);
          }
          offset = result.update_id+1;
        });
        callback(offset);
      });
  });
  // console.log(offset);
  postReq.end();
}


exports.sendMessage = sendMessage;
exports.updateMessage = updateMessage;
