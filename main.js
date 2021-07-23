
//imports from npm
const mysql = require('mysql');
const jwt_decode = require('jwt-decode');
const port = process.env.PORT || 3000;
const express = require('express')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var path = require('path');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');


app.use(express.static(__dirname + '/public'));


//import config from dotenv
dotenv.config({ path: './.env'});


app.use(cookieparser());
//create Database
const maindb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  '',
    database: 'nodejs_login',
    multipleStatements: true

});
//use public folder
app.use(express.static('./public'));

app.use(express.urlencoded({extended:false}));
app.use(express.json())
//set view to hbs
//import HBS
app.set('view engine', 'hbs')

var connection =  mysql.createConnection( maindb  );
maindb.connect( (error) => {

    console.log("Connected!");

    var userssql = "CREATE TABLE users (id int NOT NULL AUTO_INCREMENT, name VARCHAR(100), email VARCHAR(100), password VARCHAR(255), PRIMARY KEY (id))";
    maindb.query(userssql, function (error, result) {
        console.log("Users table created");
    });
    var messagessql = "CREATE TABLE messages (emitter INT(255), getter INT(255), message VARCHAR(255))";
    maindb.query(messagessql, function (error, result) {
        console.log("Messages table created");
    });
    if (error) {
        console.log(error)
    }else {
        console.log("MainDB Connected")
    }
});
//connection
io.on('connection', (socket) => {
    //get message
    socket.on('chat message',function(data) {
        // do something with data
        socket.broadcast.emit('chat message', {msg: data.msg, getter: data.getter, emitter: data.emitter});
        maindb.query('INSERT INTO messages SET ?', {emitter: data.emitter, getter: data.getter, message: data.msg}, (error) =>{
            if(error) {
                console.log(error);
            }
        });
    });
});

console.log('chat loaded')



var row = [];
var names =[];
var ids = [];

//on "/" render mainpage if cookie than render logged in
app.get("/", (req, res) => {
    try {
        var unid = req.cookies.jwt;
        var id = jwt_decode(unid);
        maindb.query('SELECT * FROM users WHERE id = ? ', [id], async (error, results) => {
            res.render('loggedin', {
                style: 'Home/style.css'
            });
        });
    } catch (InvalidTokenError) {
        res.render('index', {
            style: 'stylesheet/style_index.css'
        })
    }
});
//on "/chat" check if cookie than go to chat page (with parameters of name & email)
app.get("/chat", (req, res) => {
    try {
        var unid = req.cookies.jwt;
        var id = jwt_decode(unid);
        console.log(id.id)
        maindb.query("SELECT * FROM users", function (err, result, fields) {
            maindb.query('SELECT * FROM users WHERE id = ? ', [id.id], async (error, results) => {
                var ur_id = results[0].id;
                var ur_name = results[0].name;
                var ur_email = results[0].email;
            // if any error while executing above query, throw error
            if (err) throw err;
            // if there is no error, you have the result
            // iterate for all the rows in result
            Object.keys(result).forEach(function(key) {
                row = result[key];
                names.push(row.name);
                ids.push(row.id);

            });
            var ids2 = ids;
            var names2 = names;




                    res.render('../chat/ChatSelection', {
                        style: 'chatselectionsheets/style_login.css',
                        names: names2.toString(),
                        ids: ids2,
                        urname: ur_name,
                        urid: ur_id,
                        uremail: ur_email
                    });
                    names = [];
                    ids = [];
                    console.log("urname " + ur_name)
                    console.log("names: " + names2)
                    console.log("ids: " + ids2)


            });

        });

    } catch (InvalidTokenError) {
        res.render('login', {
            style: 'stylesheet/style_login.css'
        })
    }
});
//on "/profile" check if cookie than go to profile page (with parameters of name & email)
app.get("/profile", (req, res) => {
    try {
        let password = req.body.password;
        var unid = req.cookies.jwt;
        var id = jwt_decode(unid);
        console.log(id.id)
        maindb.query('SELECT * FROM users WHERE id = ? ', [id.id], async (error, results) => {
            console.log(results);
            res.render('profile', {
                style: 'stylesheet/style_profile.css',
                name: results[0].name,
                email: results[0].email
            });
        });
    } catch (InvalidTokenError) {
        res.render('login', {
            style: 'stylesheet/style_login.css'
        })
    }
});
//go to register
app.get("/register", (req, res) => {
    res.render('register', {
        style: 'stylesheet/style_login.css'
    })
});
//go to login
app.get("/login", (req, res) => {
    res.render('login', {
        style: 'stylesheet/style_login.css'
    })
});
// go to logout after that to index
app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.render('index', {
        style: 'stylesheet/style_index.css'
    })
});
app.use('/userchat', require("./routes/userchat"));
//use auth to authenticate account
app.use('/auth', require("./routes/auth"));

app.get("/auth/login", (req, res) => {
    res.render('login', {
        style: '../stylesheet/style_login.css'
    })
});
app.get("/auth/register", (req, res) => {
    res.render('register', {
        style: '../stylesheet/style_login.css'
    })
});

app.get("/settings", (req, res) => {
    res.render('setting', {
        style: '../stylesheet/setting_sheets.css'
    })
});

//listen to port
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
