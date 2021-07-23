const express = require('express');
const mysql = require("mysql");
const router = express.Router();
userchatcontroller = require('../controllers/UserchatController');
const maindb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:  '',
    database: 'nodejs_login',
});
router.get("/", userchatcontroller.start);

router.use


module.exports = router;

