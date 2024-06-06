const Reservation = require('../models/reservation');

// Create a new reservation
exports.createReservation = async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).send(reservation);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({});
        res.status(200).send(reservations);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a reservation by ID
exports.getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).send();
        }
        res.status(200).send(reservation);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Cancel a reservation
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).send();
        }
        reservation.status = 'cancelled';
        await reservation.save();
        res.status(200).send(reservation);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get guest stay summary
exports.getGuestStaySummary = async (req, res) => {
    try {
        const guestMemberId = req.params.guestMemberId;
        const reservations = await Reservation.find({ guestMemberId });
        console.log("here1");
        const summary = {
            guestMemberId,
            upcomingStays: { count: 0, nights: 0, amount: 0 },
            pastStays: { count: 0, nights: 0, amount: 0 },
            cancelledStays: { count: 0 },
            totalAmount: 0
        };

        const currentDate = new Date();
        reservations.forEach(reservation => {
            const nights = (new Date(reservation.departureDate) - new Date(reservation.arrivalDate)) / (1000 * 60 * 60 * 24);
            let totalAmount = 0;

            if (reservation.status === 'cancelled') {
                summary.cancelledStays.count++;
            } else if (reservation.arrivalDate > currentDate) {
                totalAmount = reservation.baseStayAmount + reservation.taxAmount;
                summary.upcomingStays.count++;
                summary.upcomingStays.nights += nights;
                summary.upcomingStays.amount += totalAmount;
            } else {
                totalAmount = reservation.baseStayAmount + reservation.taxAmount;
                summary.pastStays.count++;
                summary.pastStays.nights += nights;
                summary.pastStays.amount += totalAmount;
            }
            summary.totalAmount += totalAmount;
        });
        console.log(summary)


        res.status(200).send(summary);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
};

// Search for stays spanning a date range
exports.searchStaysByDateRange = async (req, res) => {
    try {
        console.log("reached here")
        const { startDate, endDate } = req.query;
        const reservations = await Reservation.find({
            $or: [
                { arrivalDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
                { departureDate: { $gte: new Date(startDate), $lte: new Date(endDate) } }
            ]
        });
        res.status(200).send(reservations);
    } catch (error) {
        console.log("reached here!")

        console.log(error)
        res.status(500).send(error);
    }
};
