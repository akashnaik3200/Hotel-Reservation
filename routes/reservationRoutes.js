const express = require('express');
const router = new express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/reservations', reservationController.createReservation);
router.get('/reservations', reservationController.getAllReservations);
router.get('/reservations/:id', reservationController.getReservationById);
router.patch('/reservations/:id/cancel', reservationController.cancelReservation);
router.get('/guest-summary/:guestMemberId', reservationController.getGuestStaySummary);
router.get('/reservation/search', reservationController.searchStaysByDateRange);

module.exports = router;
