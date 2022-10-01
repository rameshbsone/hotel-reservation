const express = require('express');
const router = express.Router();

const { 
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    logout
 } = require('../controllers/authContoller');

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

 const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/password/forgot').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(isAuthenticatedUser, logout);

module.exports = router;