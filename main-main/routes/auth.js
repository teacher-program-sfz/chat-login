const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth')
//when enter "/register" or "/login" than go to autcontroller.register / .login
router.post("/register", authController.register);
router.post("/login" ,authController.login);

module.exports = router;

