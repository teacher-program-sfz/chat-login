const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const request = require("express");

const express = require("express");

//get database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  '',
    database: 'nodejs_login',
});

// after entered "/auth/register" an account will create with hased password
exports.register = (req, res) => {
    console.log(req.body);

    const { name,  email,  password,  passwordconfirm} = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) =>{
        if(error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                alertmessage: 'That email is already in user',
                style: '../stylesheet/style_login.css'
            })
        } else if( password !== passwordconfirm) {
            return res.render('register', {
                alertmessage: 'Passwords do not match',
                style: '../stylesheet/style_login.css'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword}, (error, results) =>{
            if(error) {
                console.log(error);
            } else {
                console.log(results)
                return res.render('register', {
                    successmessage: 'USER registered',
                    style: '../stylesheet/style_login.css'
                })
            }
        });


    });

}

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        let password = req.body.password;


        if(!email || !password) {
            return res.status(400).render('login', {
                alertmessage: 'Please provide an email and password',
                style: '../stylesheet/style_login.css'
            });
        }
        db.query('SELECT * FROM users WHERE email = ? ', [email], async (error, results) => {
            if(results.length === 0){
                 return res.status(401).render('login', {
                     alertmessage: 'Email or Password is Incorrect',
                    style: '../stylesheet/style_login.css'
                })
            }

            if(!results || !(await bcrypt.compare(password, results[0].password))) {
                res.status(401).render('login', {
                    alertmessage: 'Email or Password is Incorrect',
                    style: '../stylesheet/style_login.css'
                })
            }
            else {
                const id = results[0].id;
                const token = jwt.sign({id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.render('loggedin', {
                    style: '../Home/style.css'
                });

                console.log('cookie', req.cookies);

            }


        }


        );

    } catch (UnhandledPromiseRejectionWarning) {
        console.log(error)
    }
}



