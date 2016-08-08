//載入MySQL模組
var mysql = require('mysql');

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'wheatherbot',
    password: 'yoyo123',
    database: 'wheatherbot',
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
