
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

//connection
io.on('connection', (socket) => {
    //get message
    socket.on('chat message', msg => {
        //send message
        socket.broadcast.emit('chat message', msg);
    });
});

console.log('chat loaded')

//import config from dotenv
dotenv.config({ path: './.env'});


app.use(cookieparser());
//create Database
const maindb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  '',
    database: 'nodejs_login',
});
//use public folder
app.use(express.static('./public'));

app.use(express.urlencoded({extended:false}));
app.use(express.json())
//set view to hbs
//import HBS
app.set('view engine', 'hbs')
maindb.connect( (error) => {
    console.log("Connected!");

    var sql = "CREATE TABLE users (id int NOT NULL AUTO_INCREMENT, name VARCHAR(100), email VARCHAR(100), password VARCHAR(255), PRIMARY KEY (id))";
    maindb.query(sql, function (error, result) {
        console.log("Users table created");
    });
    if (error) {
        console.log(error)
    }else {
        console.log("MainDB Connected")
    }
});
var row = [];
var playerrow =[];

//on "/" render mainpage if cookie than render logged in
app.get("/", (req, res) => {
    try {
        var unid = req.cookies.jwt;
        var id = jwt_decode(unid);
        maindb.query('SELECT * FROM users WHERE id = ? ', [id], async (error, results) => {
            res.render('loggedin', {
                style: 'stylesheet/style_login.css'
            });
        });
    } catch (InvalidTokenError) {
        res.render('index', {
            style: 'stylesheet/style_login.css'
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
            // if any error while executing above query, throw error
            if (err) throw err;
            // if there is no error, you have the result
            // iterate for all the rows in result
            Object.keys(result).forEach(function(key) {
                row = result[key];
                playerrow.push(row.name);
            });
            res.render('../chat/chat', {
                style: 'stylesheet/style_chat.css',
                names: playerrow.toString()
            });
            console.log(playerrow)

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
                style: 'stylesheet/style_login.css',
                style2: 'stylesheet/style_profile.css',
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
        style: 'stylesheet/style_login.css'
    })

});
//use auth to authenticate account
app.use('/auth', require("./routes/auth"));

//listen to port
http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
});
