var http = require('http');
var https = require('https');
var url = require('url');
var util = require('util');
var mysql = require('mysql');
var fs = require('fs');
var connection = null
var remoteConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Tang@990217',
    database: 'qiyatang',
    charset: "UTF8MB4"
}
// 数据库八小时断连，需要处理一下
function handleDisconnection() {
    connection = mysql.createConnection(remoteConfig)

    connection.connect(function (err) {
        if (err) {
            console.log('connection errr', err);
            setTimeout(handleDisconnection, 2000);
        }
    });

    connection.on('error', function (err) {
        console.log('db error', err, new Date().toLocaleString());
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('db error执行重连:' + err.message);
            handleDisconnection();
        } else {
            throw err;
        }
    });
}
handleDisconnection();

const app = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    // res.setHeader("Access-Control-Allow-Origin", "https://www.dododawn.com"); // 设置可访问的源
    // res.setHeader("Access-Control-Allow-Origin", "http://www.dododawn.com"); // 设置可访问的源
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    // 解析 url 参数
    var params = url.parse(req.url, true).query;
    switch (params.option) {
        case 'add':
            var sql = "insert into leavemessage(userId,userName,userSex,userMes,userDate,star,mesReply) values(?,?,?,?,?,0,?)"
            var sqlParams = [params.userId, params.userName, params.userSex, params.userMes, params.userDate, params.mesReply]
            connection.query(sql, sqlParams, function (error, results, fields) {
                if (error) console.log(error)
                else {
                    console.log("res", results)
                    res.write(JSON.stringify(results));
                    res.end();
                }
            });
            break;
        case 'get':

            connection.query('SELECT * from leavemessage', function (error, results, fields) {
                if (error) console.log(error)
                else {
                    res.write(JSON.stringify(results));
                    res.end();
                }
            });

            break;
        case 'star':
            var sql = "update leavemessage set star=? where id=?"
            console.log("star:", params.star)
            var sqlParams = [params.star, params.id]
            connection.query(sql, sqlParams, function (error, results, fields) {
                if (error) console.log(error)
                else {
                    console.log("res", results)
                    res.write(JSON.stringify(results));
                    res.end();
                }
            });
            break;
        case 'reply':
            var sql = "update leavemessage set mesReply=? where id=?"
            var sqlParams = [params.mesReply, params.id]
            connection.query(sql, sqlParams, function (error, results, fields) {
                if (error) console.log(error)
                else {
                    console.log("res", results)
                    res.write(JSON.stringify(results));
                    res.end();
                }
            });
            break;
        default:
            break;
    }
}

http.createServer(app).listen(8081);

https.createServer({
    key: fs.readFileSync("/www/wwwroot/ssl/Nginx/0_dododawn.com.key"),
    cert: fs.readFileSync("/www/wwwroot/ssl/Nginx/1_dododawn.com_bundle.pem")
}, app).listen(8080);

// 控制台会输出以下信息
console.log('Server running at https://127.0.0.1:8080/');
console.log('Server running at http://127.0.0.1:8081/');
