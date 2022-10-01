const express = require('express');
const router = express.Router();

const { 
    getUserProfile,
    updatePassword,
    updateUser,
    getUsers,
    deleteUserAdmin
 } = require('../controllers/userController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.use(isAuthenticatedUser);

router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateUser);

router.route('/password/update').put(isAuthenticatedUser, updatePassword);


// Admin only routes
router.route('/users').get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router.route('/user/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUserAdmin);


module.exports = router;