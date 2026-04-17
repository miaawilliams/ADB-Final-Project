const { db } = require('../database/setup');

beforeAll(async () => {
    await db.sync({ force: true });
});

afterEach(async () => {
    await db.truncate({ cascade: true });
});

afterAll(async () => {
    await db.close();
});