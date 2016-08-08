var querystring = require('querystring');
var http = require('http');

function sendMessage(chatId, text) {
  // Build the post string from an object
  var postData = querystring.stringify({
      'chat_id' : chatId,
      'text': text
  });
  // An object of options to indicate where to post to
  var postOptions = {
      host: 'api.telegram.org',
      path: 'bot247328895:AAFvQ8H0mqHEtN_YI4qmg7qEHfx4drsDA7c/sendMessage',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
      }
  };
  // Set up the request
  var postReq = http.request(postOptions, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  // post the data
  postReq.write(postData);
  postReq.end();
}

exports.sendMessage = sendMessage;
