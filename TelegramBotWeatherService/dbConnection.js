//載入MySQL模組
var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'us-cdbr-iron-east-04.cleardb.net',
    user: 'b44e9dbc2ad0fb',
    password: '956374b8',
    database: 'heroku_2d8d79a4be116d0',
    port: 3306
});

function query(sql, data, callback){
    pool.getConnection(function(err,conn){
        if(err){
          console.log("POOL ==> " + err);
        }else{
            conn.query(sql, data, function(qerr,vals,fields){
                conn.release();
                callback(qerr,vals,fields);
            });
        }
    });
}

exports.query = query;
