const Reservation = require('../models/reservations');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFilters = require('../utils/apiFilters');
const path = require('path');
const fs = require('fs');

// Get all Reservations  =>  /api/v1/reservations
exports.getReservations = catchAsyncErrors(async (req, res, next) => {

    const apiFilters = new APIFilters(Reservation.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination();

    const reservations = await apiFilters.query;

    res.status(200).json({
        success: true,
        results: reservations.length,
        data: reservations
    });
});

// Create a new Reservation   =>  /api/v1/reservation/new
exports.newReservation = catchAsyncErrors(async (req, res, next) => {

    // Adding user to body
//    req.body.user = req.user.id;

    const reservation = await Reservation.create(req.body);

    res.status(200).json({
        success: true,
        message: 'New hotel Reservation Created.',
        data: reservation
    });
});

// Get a single reservation with reservation id and guest member id  =>  /api/v1/reservation/:id/:guest_member_id
exports.getReservation = catchAsyncErrors(async (req, res, next) => {

    const reservation = await Reservation.find({ $and: [{ _id: req.params.id }, { guest_member_id: req.params.guest_member_id }] }).populate({
        path: 'user',
        select: 'name'
    });

    if (!reservation || reservation.length === 0) {
        return next(new ErrorHandler('Reservation not found', 404));
    }

    res.status(200).json({
        success: true,
        data: reservation
    });
});

// Update a Reservation  =>  /api/v1/reservation/:id
exports.updateReservation = catchAsyncErrors(async (req, res, next) => {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        return next(new ErrorHandler('Reservation not found', 404));
    }


    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: 'Reservation is updated.',
        data: reservation
    });
});

// Cancel a Reservation  =>  /api/v1/reservation/:id/cancel
exports.cancelReservation = catchAsyncErrors(async (req, res, next) => {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        return next(new ErrorHandler('Reservation not found', 404));
    }


    reservation = await Reservation.findByIdAndUpdate(req.params.id, {
        new: true,
        runValidators: false,
        useFindAndModify: false,
        status: "Cancelled"
    });

    res.status(200).json({
        success: true,
        message: 'Reservation is cancelled.',
        data: reservation
    });
});


// Retrieves the stay summary for a specific guest => /api/v1/guest/:guest_member_id
exports.guestStays = catchAsyncErrors(async (req, res, next) => {
    var summary = {guest_member_id: req.params.guest_member_id, past_stay_info: await stay_info(req.params.guest_member_id.toString(), 'Active', "$lt"), upcoming_stay_info: await stay_info(req.params.guest_member_id.toString(), 'Active', "$gt"), cancellations_info: await stay_info(req.params.guest_member_id.toString(), 'Cancelled', "$lt")};

    res.status(200).json({
        success: true,
        data: summary
    });
});


// Retrieves past stay info for a specific guest
const stay_info = async(guest_member_id, status, departure_date_comparitor) => {
    var departure_date_comparison = {};
    var today = (new Date((new Date()).getTime()));
    if (departure_date_comparitor === '$lt') departure_date_comparison = {$lt: today};
    if (departure_date_comparitor === '$gt') departure_date_comparison = {$gt: today};

    var project_fields = await projected_fields();

    var match_fields = {
        '$and': [
            {
                'guest_member_id': guest_member_id, 
                'status': status,
                'departure_date': departure_date_comparison
            }
        ]
    };

    var group_fields = {
        '_id': '$guest_member_id', 
        'total_reservations': {
            '$sum': 1
        }, 
        'total_revenue': {
            '$sum': '$stay_amount'
        }, 
        'reserved_nights': {
            '$sum': '$stay_days'
        }
    };

    if (status === 'Cancelled') {
        delete match_fields.$and[0].departure_date
        group_fields = {
            '_id': '$guest_member_id', 
            'total_cancellations': {
            '$sum': 1
        }
        }
    };

    const stats = await Reservation.aggregate(
        [
            {
                '$project': project_fields
            }, 
            {
                '$match': match_fields
            }, 
            {
                '$group': group_fields
            }
        ]
    );

    if (stats.length === 0) {
        return "No past history"
    }

    delete stats[0]._id
    return stats[0]
};


// Retrieves the stays for last no of days or future no of days relative today => /api/v1/reservations/in/days/:no_of_days
exports.staysInrange = catchAsyncErrors(async (req, res, next) => {
        var summary = {reservations: await stay_count(req.params.no_of_days, 'Active'), cancelled_reservations: await stay_count(req.params.no_of_days, 'Cancelled')};

        res.status(200).json({
            success: true,
            data: summary
        });
    });

const stay_count = async(no_of_days, status) => {
    var departure_date_comparison = {};
    var today = (new Date((new Date()).getTime()));
    var target_date = (new Date((new Date()).getTime() + (no_of_days * 24 * 60 * 60 * 1000)));

    if (no_of_days < 0) departure_date_comparison = { $gte:target_date,  $lt:today };
     
    if (no_of_days > 0) departure_date_comparison = { $gte:today, $lte:target_date };

    var project_fields = await projected_fields();

    var match_fields = {
        '$and': [
            {
                'status': status,
                'departure_date': departure_date_comparison
            }
        ]
    };

    var group_fields = {
        '_id': '$guest_member_id', 
        'total_reservations': {
            '$sum': 1
        }, 
        'total_revenue': {
            '$sum': '$stay_amount'
        }, 
        'reserved_nights': {
            '$sum': '$stay_days'
        }
    };

    const stats = await Reservation.aggregate(
        [
            {
                '$project': project_fields
            }, 
            {
                '$match': match_fields
            }, 
            {
                '$group': group_fields
            }
        ]
    );

    if (stats.length === 0) {
        return "No stays found"
    };

    delete stats[0]._id
    return stats[0]
};


const projected_fields = async () => {
    select_fields = {
        '_id': 0, 
        'guest_member_id': 1, 
        'departure_date': 1, 
        'arrival_date': 1, 
        'status': 1, 
        'base_stay_amount': 1, 
        'stay_days': {
            '$round': [
                {
                    '$divide': [
                        {
                            '$subtract': [
                                '$departure_date', '$arrival_date'
                            ]
                        }, 86400000
                    ]
                }
            ]
        }, 
        'stay_amount': {
            '$add': [
                {
                    '$multiply': [
                        '$base_stay_amount', {
                            '$round': [
                                {
                                    '$divide': [
                                        {
                                            '$subtract': [
                                                '$departure_date', '$arrival_date'
                                            ]
                                        }, 86400000
                                    ]
                                }
                            ]
                        }
                    ]
                }, '$tax_amount'
            ]
        }
    }
    return select_fields;
};
