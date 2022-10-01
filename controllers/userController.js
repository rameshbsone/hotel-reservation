const User = require('../models/users');
const Reservation = require('../models/reservations');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const fs = require('fs');
const APIFilters = require('../utils/apiFilters');

// Get current user profile   =>    /api/v1/me
exports.getUserProfile = catchAsyncErrors( async(req, res, next) => {

    const user = await User.findById(req.user.id)
        .populate({
            path : 'reservationsCreated',
            select : 'guest_name departure_date'
        });

    res.status(200).json({
        success : true,
        data : user
    })
});

// Update current user Password   =>    /api/v1/password/update
exports.updatePassword = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.currentPassword);
    if(!isMatched) {
        return next(new ErrorHandler('Old Password is incorrect.', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});

// Update current user data   =>    /api/v1/me/update
exports.updateUser = catchAsyncErrors( async(req, res, next) => {
    const newUserData = {
        name : req.body.name,
        email : req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new : true,
        runValidators : true,
        useFindAndModify : false
    });

    res.status(200).json({
        success : true,
        data : user
    });
});


// Adding controller methods that is only accessible by admins

// Show all users  =>   /api/v1/users
exports.getUsers = catchAsyncErrors( async (req, res, next) => {
    const apiFilters = new APIFilters(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

    const users = await apiFilters.query;

    res.status(200).json({
        success : true,
        results : users.length,
        data : users
    })
});

// Delete User(Admin)   =>   /api/v1/user/:id
exports.deleteUserAdmin = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    await user.remove();

    res.status(200).json({
        success : true,
        message : 'User is deleted by Admin.'
    });

});