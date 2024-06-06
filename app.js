const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/hotelReservations', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(reservationRoutes);

module.exports = app;
