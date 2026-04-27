process.env.JWT_SECRET = 'testsecret';
process.env.JWT_EXPIRES_IN = '1h'; 

const request = require('supertest');
const bcrypt = require('bcryptjs');


const app = require('../app'); 
const { user, db } = require('../database/setup');
const jwt = require('jsonwebtoken');

let adminToken;
let employeeToken;
let testUserId;

beforeAll(async () => {
    await db.sync({ force: true });

    const hashedPassword = await bcrypt.hash('password', 10);

    const admin = await user.create({
        name: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
    });

    const employee = await user.create({
        name: 'Employee',
        email: 'employee@test.com',
        password: '$2a$10$hashedpassword',
        role: 'employee'
    });

    adminToken = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET
    );

    employeeToken = jwt.sign(
        { id: employee.id, email: employee.email, role: employee.role },
        process.env.JWT_SECRET
    );
});

afterAll(async () => {
    await db.close();
});




// User tests

test('POST /api/register - should create user', async () => {
    const res = await request(app)
        .post('/api/register')
        .send({
            name: 'Test User',
            email: 'test@test.com',
            password: 'password'
        });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('test@test.com');

    testUserId = res.body.id;
});

test('POST /api/login - success', async () => {
    const res = await request(app)
        .post('/api/login')
        .send({
            email: 'test@test.com',
            password: 'password'
        });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
});

test('GET /api/users - admin success', async () => {
    const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
});

test('GET /api/users - unauthorized', async () => {
    const res = await request(app)
        .get('/api/users');

    expect(res.statusCode).toBe(401);
});

test('DELETE /api/users/:id - admin deletes user', async () => {
    const res = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
});


// Store tests

test('POST /api/stores - admin creates store', async () => {
    const res = await request(app)
        .post('/api/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            name: 'Test Store',
            address: '123 Main St'
        });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Store');
});

test('GET /api/stores - requires auth', async () => {
    const res = await request(app)
        .get('/api/stores')
        .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
});

test('POST /api/business-hours - admin creates', async () => {
    const res = await request(app)
        .post('/api/business-hours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            storeId: 1,
            dayOfWeek: 'Monday',
            openTime: '09:00',
            closeTime: '17:00',
            isClosed: false
        });

    expect(res.statusCode).toBe(201);
});

test('GET /api/business-hours - authenticated', async () => {
    const res = await request(app)
        .get('/api/business-hours')
        .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
});

