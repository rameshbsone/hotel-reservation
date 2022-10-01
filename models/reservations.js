const mongoose = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const reservationSchema = new mongoose.Schema({
    guest_member_id : {
        type : String,
        required : [false, 'Please enter guest member id.'],
        trim : true,
        maxlength : [10, 'Guest member id can not exceed 10 characters.'],
        default : ""
    },
    guest_name : {
        type : String,
        trim : true,        
        required : [true, 'Please enter the name of the guest.'],
        maxlength : [50, 'Guest name can not exceed 50 characters.']
    },
    guest_email : {
        type : String,
        validate : [validator.isEmail, 'Please add a valid email address.']
    },
    hotel_name : {
        type : String,
        trim : true,
        required : [true, 'Please add the name of the hotel.']
    },
    status : {
        type : String,
        required : [true, 'Please select reservation status.'],
        enum : {
            values : [
                'Active',
                'Cancelled'
            ],
            message : 'Valid statuses are Active/Cancelled.'
        }
    },
    base_stay_amount : {
        type : Number,
        default : 5000.00
    },
    tax_amount : {
        type : Number,
        default : 0.00
    },
    arrival_date : {
        type : Date,
        default : Date.now
    },
    departure_date : {
        type : Date,
        default : new Date().setDate(new Date().getDate() + 1)
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : false
    }
});


reservationSchema.pre('save', function(next) {
    // Creating slug before saving to DB
    if (this.guest_member_id === "")
        this.guest_member_id = Math.floor((Math.random() * 100000) + 1).toString();

    next();
});


module.exports = mongoose.model('Reservation', reservationSchema);