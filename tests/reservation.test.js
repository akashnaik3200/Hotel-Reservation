const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Reservation = require('../models/reservation');

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect('mongodb://127.0.0.1:27017/hotelReservationsTest', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    await Reservation.deleteMany({});
});

describe('Reservation API', () => {
    test('Should create a new reservation', async () => {
        const response = await request(app)
            .post('/reservations')
            .send({
                guestMemberId: '1',
                guestName: 'Akash Naik',
                hotelName: 'Bengaluru hotel',
                arrivalDate: '2023-06-01',
                departureDate: '2023-06-05',
                baseStayAmount: 500,
                taxAmount: 50
            })
            .expect(201);

        expect(response.body.guestName).toBe('Akash Naik');
        expect(response.body.status).toBe('active');
    });

    test('Should retrieve all reservations', async () => {
        await Reservation.create({
            guestMemberId: '1',
            guestName: 'Akash Naik',
            hotelName: 'Bengaluru hotel',
            arrivalDate: '2023-06-01',
            departureDate: '2023-06-05',
            status: 'active',
            baseStayAmount: 500,
            taxAmount: 50
        });

        const response = await request(app).get('/reservations').expect(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].guestName).toBe('Akash Naik');
    });

    test('Should retrieve a reservation by ID', async () => {
        const reservation = await Reservation.create({
            guestMemberId: '1',
            guestName: 'Akash Naik',
            hotelName: 'Bengaluru hotel',
            arrivalDate: '2023-06-01',
            departureDate: '2023-06-05',
            status: 'active',
            baseStayAmount: 500,
            taxAmount: 50
        });

        const response = await request(app).get(`/reservations/${reservation._id}`).expect(200);
        expect(response.body.guestName).toBe('Akash Naik');
    });

    test('Should cancel a reservation', async () => {
        const reservation = await Reservation.create({
            guestMemberId: '1',
            guestName: 'Akash Naik',
            hotelName: 'Bengaluru hotel',
            arrivalDate: '2023-06-01',
            departureDate: '2023-06-05',
            status: 'active',
            baseStayAmount: 500,
            taxAmount: 50
        });

        const response = await request(app).patch(`/reservations/${reservation._id}/cancel`).expect(200);
        expect(response.body.status).toBe('cancelled');
    });

    test('Should retrieve a guest stay summary', async () => {
        await Reservation.create([
            {
                guestMemberId: '1',
                guestName: 'Akash Naik',
                hotelName: 'Bengaluru hotel',
                arrivalDate: '2025-06-01',
                departureDate: '2025-06-05',
                status: 'active',
                baseStayAmount: 500,
                taxAmount: 50
            },
            {
                guestMemberId: '1',
                guestName: 'Akash Naik',
                hotelName: 'City Hotel',
                arrivalDate: '2022-06-01',
                departureDate: '2022-06-05',
                status: 'active',
                baseStayAmount: 400,
                taxAmount: 40
            },
            {
                guestMemberId: '1',
                guestName: 'Akash Naik',
                hotelName: 'Beach Resort',
                arrivalDate: '2022-01-01',
                departureDate: '2022-01-05',
                status: 'cancelled',
                baseStayAmount: 600,
                taxAmount: 60
            }
        ]);

        const response = await request(app).get(`/guest-summary/1`).expect(200);
        expect(response.body.guestMemberId).toBe('1');
        expect(response.body.upcomingStays.count).toBe(1);
        expect(response.body.pastStays.count).toBe(1);
        expect(response.body.cancelledStays.count).toBe(1);
        expect(response.body.totalAmount).toBe(990);  // 500+50 (upcoming) + 400+40 (past)
    });

    test('Should search reservations by date range', async () => {
        await Reservation.create([
            {
                guestMemberId: '1',
                guestName: 'Akash Naik',
                hotelName: 'Bengaluru hotel',
                arrivalDate: '2023-06-01',
                departureDate: '2023-06-05',
                status: 'active',
                baseStayAmount: 500,
                taxAmount: 50
            },
            {
                guestMemberId: '2',
                guestName: 'Akash 1',
                hotelName: 'City Hotel',
                arrivalDate: '2022-06-01',
                departureDate: '2022-06-05',
                status: 'active',
                baseStayAmount: 400,
                taxAmount: 40
            }
        ]);

        const response = await request(app).get('/reservation/search?startDate=2022-01-01&endDate=2022-12-31').expect(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].guestName).toBe('Akash 1');
    });
});