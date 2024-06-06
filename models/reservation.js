const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    guestMemberId: { type: String, required: true },
    guestName: { type: String, required: true },
    hotelName: { type: String, required: true },
    arrivalDate: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    baseStayAmount: { type: Number, required: true },
    taxAmount: { type: Number, required: true }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
