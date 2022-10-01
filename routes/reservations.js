const express = require('express');
const router = express.Router();

// Importing reservations controller methods
const { 
    getReservations,
    getReservation,
    newReservation,
    updateReservation,
    cancelReservation,
    guestStays,
    staysInrange
} = require('../controllers/reservationsController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.use(isAuthenticatedUser);

// Manager & employee accessible routes
router.route('/reservations').get(isAuthenticatedUser, authorizeRoles('manager', 'employee'), getReservations);

router.route('/reservation/:id/:guest_member_id').get(isAuthenticatedUser, authorizeRoles('manager', 'employee'), getReservation);

router.route('/reservation/new').post(isAuthenticatedUser, authorizeRoles('manager', 'employee'), newReservation);

router.route('/reservation/:id').put(isAuthenticatedUser, authorizeRoles('manager', 'employee'), updateReservation);

router.route('/reservation/:id/cancel').put(isAuthenticatedUser, authorizeRoles('manager', 'employee'), cancelReservation);

// Manager only routes
router.route('/guest/:guest_member_id').get(isAuthenticatedUser, authorizeRoles('manager'), guestStays);

router.route('/reservations/in/days/:no_of_days').get(isAuthenticatedUser, authorizeRoles('manager'), staysInrange);

module.exports = router;